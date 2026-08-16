"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Coordinates } from "@/lib/portal/domains";
import { trackEvent } from "@/lib/analytics";
import { playClick } from "@/lib/sound";

/**
 * Talking to the guide.
 *
 * Sits after the portrait step, so by the time anyone reaches it they have
 * either signed in or chosen to skip. Signed-out visitors pass straight
 * through rather than meeting a second gate — one account ask per journey is
 * enough.
 *
 * The channel holds a fixed number of turns on purpose. Scarcity is the
 * product: a guide who will answer forever is a chatbot, and the whole premise
 * is that only so much gets through.
 */

const MAX_USER_TURNS = 5;
const MAX_CHARS = 500;

interface Turn {
  role: "user" | "assistant";
  text: string;
}

const OPENERS = [
  "What did you change first?",
  "What was the hardest part?",
  "What do I do today?",
];

export function ConversationPanel({
  coords,
  onDone,
}: {
  coords: Coordinates;
  onDone: () => void;
}) {
  const { session, loading } = useSession();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const asked = turns.filter((t) => t.role === "user").length;
  const spent = asked >= MAX_USER_TURNS;

  const send = useCallback(
    async (text: string) => {
      const message = text.trim().slice(0, MAX_CHARS);
      if (!message || streaming || spent) return;
      const supabase = getSupabase();
      if (!supabase) return;

      playClick();
      setError(null);
      setInput("");
      const next: Turn[] = [...turns, { role: "user", text: message }];
      setTurns([...next, { role: "assistant", text: "" }]);
      setStreaming(true);

      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("no session");

        const res = await fetch("/api/portal/conversation", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: coords.domain,
            goal: coords.goal,
            horizon: coords.horizon,
            turns: next,
          }),
        });
        if (!res.ok || !res.body) {
          const json = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(json?.error ?? "The channel dropped.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          // Replace the trailing placeholder as text arrives.
          setTurns([...next, { role: "assistant", text: acc }]);
          endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
        }
        trackEvent("portal_conversation_turn", { domain: coords.domain });
      } catch (e) {
        setTurns(next);
        setError(e instanceof Error ? e.message : "The channel dropped.");
      } finally {
        setStreaming(false);
      }
    },
    [turns, streaming, spent, coords],
  );

  // Signed out: no second gate. They were already offered an account at the
  // portrait step and said no; asking twice would be nagging.
  if (!loading && !session) {
    return (
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-pretty text-muted-foreground">
          Signed in, you could ask them things. For now, take the line.
        </p>
        <button
          type="button"
          onClick={() => {
            playClick();
            onDone();
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-mode px-8 py-4 text-lg font-semibold text-mode-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Take the line
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-mode-2">
        Ask them something
      </p>

      {turns.length > 0 ? (
        <div className="mt-6 flex flex-col gap-5">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <p key={i} className="self-end rounded-2xl bg-card/70 px-4 py-2.5 text-left text-sm">
                {t.text}
              </p>
            ) : (
              <p
                key={i}
                className="font-display transmission-voice text-balance text-left text-base leading-relaxed sm:text-lg"
              >
                {t.text}
                {streaming && i === turns.length - 1 ? (
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-mode-2 align-middle" />
                ) : null}
              </p>
            ),
          )}
          <div ref={endRef} />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {OPENERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              className="rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-mode/50 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-5 text-center text-sm text-mode-2" aria-live="polite">
          {error}
        </p>
      ) : null}

      {!spent ? (
        <form
          className="mt-7 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            type="text"
            value={input}
            maxLength={MAX_CHARS}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
            placeholder="Ask them&hellip;"
            className="min-w-0 flex-1 rounded-full border border-border bg-card/60 px-5 py-3.5 outline-none transition-colors focus:border-mode disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            aria-label="Send"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mode text-mode-foreground shadow-lg transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          >
            <CornerDownLeft className="size-5" aria-hidden />
          </button>
        </form>
      ) : (
        <p className="mt-7 text-center text-sm text-muted-foreground">
          That&apos;s all this channel holds today.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          playClick();
          onDone();
        }}
        disabled={streaming}
        className={`mt-6 self-center rounded-full px-8 py-3.5 font-semibold transition-transform disabled:opacity-40 ${
          spent || turns.length > 0
            ? "bg-mode text-mode-foreground shadow-lg enabled:hover:-translate-y-0.5"
            : "text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        }`}
      >
        {spent || turns.length > 0 ? "Take the line" : "Skip — just give me the line"}
      </button>
    </div>
  );
}
