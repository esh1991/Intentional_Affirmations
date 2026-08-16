import { DOMAINS, type DomainKey, horizonLabel, type HorizonKey } from "@/lib/portal/domains";

/**
 * Portrait generation on fal.
 *
 * THE PHOTO POLICY, precisely:
 * the source selfie is **never written to our storage at all** — not to disk,
 * not to Vercel Blob, not to Postgres. It exists only in the request body and
 * in the data URI handed to fal for processing. What we keep is the generated
 * portrait. That is stronger than "deleted after use", and it is what the
 * consent copy must say — including, honestly, that the photo is sent to a
 * third-party model provider to be processed.
 *
 * Server-only. FAL_KEY must never be NEXT_PUBLIC_.
 */

const MODEL = "fal-ai/nano-banana/edit";

/** 6MB ceiling on the uploaded selfie — generous for a phone photo, bounded. */
export const MAX_SELFIE_BYTES = 6 * 1024 * 1024;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function portraitGenerationEnabled(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export interface PortraitRequest {
  /** Data URI of the user's selfie. Never persisted. */
  selfieDataUri: string;
  domain: DomainKey;
  goal: string;
  horizon: HorizonKey;
}

/**
 * The transmission grade is applied in CSS, not here — the model produces a
 * clean photograph and `.transmission` does the vignette, grain and chroma
 * shift. Keeping the grade in CSS means it can be retuned without regenerating
 * anyone's portrait.
 */
function buildPrompt(domain: DomainKey, goal: string, horizon: HorizonKey): string {
  const d = DOMAINS[domain];
  const achieved = goal.trim() || d.example;
  return [
    "Photorealistic portrait of the exact same person as the reference image.",
    "Preserve their identity precisely: same face, bone structure, skin tone, and features.",
    `Show them ${horizonLabel(horizon).toLowerCase()} from now, as someone who ${achieved}.`,
    "They look settled, capable and calm — quietly proud, not triumphant, never posed or smug.",
    "Natural environment and clothing that fit that life; warm directional light.",
    "Documentary portrait photography, visible natural skin texture with pores and fine lines,",
    "no digital smoothing, no beauty filter, no airbrushed look, matte-to-natural complexion,",
    "shallow depth of field, single subject only, exactly one person, no other people,",
    "no text, no watermark, no logos.",
  ].join(" ");
}

export interface PortraitResult {
  /** Raw bytes of the generated portrait, ready to store. */
  bytes: ArrayBuffer;
  contentType: string;
}

/**
 * Generates the portrait and returns its bytes.
 *
 * Uses fal's synchronous endpoint: this model returns in seconds, so the queue
 * + webhook flow would add moving parts without buying anything. If a slower
 * model is swapped in later, move to the queue and poll the job row that the
 * calling route already creates.
 */
export async function generatePortrait(
  req: PortraitRequest,
): Promise<PortraitResult> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("Portrait generation is not configured.");

  const response = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: buildPrompt(req.domain, req.goal, req.horizon),
      // A data URI keeps the selfie out of any public bucket. Uploading it
      // somewhere fetchable purely so the model could reach it would defeat
      // the whole privacy posture.
      image_urls: [req.selfieDataUri],
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`fal ${response.status}: ${detail.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    images?: Array<{ url?: string; content_type?: string }>;
  };
  const image = payload.images?.[0];
  if (!image?.url) throw new Error("fal returned no image.");

  const fetched = await fetch(image.url);
  if (!fetched.ok) throw new Error(`Couldn't download the portrait (${fetched.status}).`);

  return {
    bytes: await fetched.arrayBuffer(),
    contentType: image.content_type ?? "image/jpeg",
  };
}
