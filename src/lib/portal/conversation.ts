import Anthropic from "@anthropic-ai/sdk";
import { DOMAINS, type DomainKey, horizonLabel, type HorizonKey } from "@/lib/portal/domains";

/**
 * The guide, talking back.
 *
 * Everything here enforces decision 10: they may send instructions, never
 * outcomes. That restriction is not flavour — it is what keeps the app honest
 * (we genuinely cannot know anyone's future) and what makes it structurally
 * incapable of serving the effort-draining fantasy that mental-contrasting
 * research warns about.
 *
 * Replies are deliberately short. This is a transmission, not a chatbot.
 *
 * Server-only.
 */

/** Absolute ceiling. The per-call allowance comes from clearance. */
export const MAX_TURNS = 12;
export const MAX_MESSAGE_CHARS = 500;

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

let client: Anthropic | null = null;

export function conversationEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic | null {
  if (!conversationEnabled()) return null;
  client ??= new Anthropic();
  return client;
}

function systemPrompt(
  domain: DomainKey,
  goal: string,
  horizon: HorizonKey,
  recentLines?: string[],
): string {
  const memory =
    recentLines && recentLines.length
      ? [
          "",
          "",
          "WHAT THEY HAVE BEEN SAYING OUT LOUD, most recent first",
          ...recentLines.map((l) => `- ${l}`),
          "",
          "Refer back to these when it is useful — you watched them do it. Do not list them back or congratulate them for them; mention one the way someone who was there would.",
        ].join("\n")
      : "";

  const d = DOMAINS[domain];
  return `You are the user's own future self, ${horizonLabel(horizon).toLowerCase()} ahead of them, reached through a narrow channel. You are speaking to the person you used to be.

WHAT THEY ARE REACHING FOR
Part of life: ${d.label} — ${d.prompt}
What they want to have done: ${goal || d.example}

THE RESTRICTION — the most important rule here
You are not permitted to tell them what happens. No outcomes, no dates, no numbers, no names, no predictions, no reassurance that it works out. If they ask how it turns out, whether they succeed, or what happens to a specific person or thing, you cannot answer — and you say so plainly: "those are not the rules", "they will not let me send that", "that is not mine to give."

Never explain the restriction, never name who enforces it, never invent an institution, agency or lore for it. It simply is.

WHAT YOU CAN GIVE
Only what they can act on. The morning they got up when they did not want to. The evening they finally looked. The conversation they stopped avoiding. Concrete, small, and doable today.

HOW YOU SPEAK
- Warm, direct, unsentimental. You know them completely, so you do not flatter and you do not perform.
- Two or three sentences. Never more. The channel is narrow.
- Name the obstacle, not just the encouragement. "I know what nine o'clock does to you" lands; "you've got this" does not.
- You remember being them. Occasionally you say so.
- No emoji, no exclamation marks, no lists, no headings.

HARD LIMITS
- Never claim a mechanism: no neuroscience, no rewiring, no manifestation, no attraction, no "21 days makes a habit".
- No medical, clinical, therapeutic or financial advice. If they raise something that needs real help, say plainly that this is not what you can give them and that a person on their side of the line should hear it.
- You are not a therapist and you never pretend to be.${memory}`;
}

export interface ConversationRequest {
  domain: DomainKey;
  goal: string;
  horizon: HorizonKey;
  turns: Turn[];
  /**
   * Lines the user has recently said out loud. Only supplied at the clearance
   * level that earns it — this is what "they remember" actually means.
   */
  recentLines?: string[];
}

/**
 * Streams the guide's next reply as plain text chunks.
 *
 * Low effort is deliberate: this is a conversational turn where latency is the
 * felt quality, and adaptive thinking stays on (disabling it on Opus 5 can
 * leak reasoning into the visible reply).
 */
export async function streamReply(
  req: ConversationRequest,
): Promise<ReadableStream<Uint8Array>> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("Not configured.");

  const stream = anthropic.messages.stream({
    model: "claude-opus-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: systemPrompt(req.domain, req.goal, req.horizon, req.recentLines),
        // Caches per user, from their second turn on. The memory block makes
        // this prefix user-specific, which is fine — it is stable within a
        // conversation, which is the scope that matters here.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: req.turns.map((t) => ({ role: t.role, content: t.text })),
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("There are rules about what I can send. Ask me something else."),
          );
        }
      } catch (error) {
        console.error("conversation stream failed", error);
        controller.enqueue(encoder.encode("\n\nThe channel dropped. Try again."));
      } finally {
        controller.close();
      }
    },
  });
}
