"use client";

/* Google Identity Services (GSI) — the ID-token sign-in flow.
 *
 * WHY NOT signInWithOAuth: that redirect flow uses the single Google client
 * configured on the Supabase project. This project is now shared with First
 * 100, so every app on it would show the same "Sign in to X" consent screen —
 * the exact problem that split the projects apart in July.
 *
 * The ID-token flow instead lets each app keep its OWN Google Cloud project and
 * client id, so each gets its own consent-screen branding. Supabase accepts a
 * token from any client id listed under Authorized Client IDs on its Google
 * provider, and validates the token's `aud` against that list.
 *
 * Consequence worth knowing: this flow issues no refresh token, so it can never
 * be used to call a Google API on the user's behalf (Sheets, Drive, Calendar).
 * That needs the authorization-code flow with offline access, which cannot
 * share this sign-in path.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

export type GsiCredentialResponse = { credential: string };

type GsiButtonOptions = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with";
  shape?: "rectangular" | "pill";
  width?: number;
  logo_alignment?: "left" | "center";
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: GsiCredentialResponse) => void;
            nonce?: string;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: GsiButtonOptions): void;
        };
      };
    };
  }
}

/**
 * A nonce pair. Google is given the SHA-256 hash (hex); Supabase is given the
 * raw value and hashes it again to compare. Passing them the other way round
 * fails with an error message that explains nothing, so the two are returned
 * together and named unambiguously.
 */
export async function makeNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = crypto.randomUUID();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

let loading: Promise<void> | undefined;

/**
 * Load the GSI script once per page. Rejects if the script can't load — which
 * is a real and fairly common case (ad blockers and hardened privacy browsers
 * block it), so callers must handle the rejection and say so, rather than
 * leaving the user staring at an empty space where a button should be.
 */
export function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("GSI is browser-only"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      loading = undefined; // let a retry re-attempt the load
      reject(new Error("Google sign-in script failed to load"));
    });
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return loading;
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
