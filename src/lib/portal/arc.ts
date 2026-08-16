import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { content } from "@/lib/content";
import { DOMAINS, type DomainKey, horizonLabel, type HorizonKey } from "@/lib/portal/domains";

/**
 * Arc generation — the 21 lines a guide is cleared to send.
 *
 * The 273 owner-approved journey entries are not discarded by the portal
 * rewrite: they become the **style contract**. Generated arcs inherit the
 * owner's voice because the prompt literally shows it, and the honest-science
 * guardrails ride in the same cached prefix.
 *
 * Server-only. ANTHROPIC_API_KEY must never be NEXT_PUBLIC_.
 */

/**
 * Reuses the shape of `affirmationSchema` in src/lib/content.ts so generated
 * days and shipped content stay interchangeable.
 *
 * Note on the `.length(21)`: structured outputs do not support array-length
 * constraints, so the API will not enforce it. The SDK strips it from the
 * schema it sends and Zod validates it client-side instead — which is what we
 * want, because a short arc should fail loudly rather than silently ship 19
 * days into someone's 21-day commitment.
 */
const arcDaySchema = z.object({
  affirmation: z.string().min(1),
  successMessage: z.string().min(1),
});

const arcSchema = z.object({
  days: z.array(arcDaySchema).length(21),
});

export type ArcDay = z.infer<typeof arcDaySchema>;

let client: Anthropic | null = null;

export function arcGenerationEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic | null {
  if (!arcGenerationEnabled()) return null;
  client ??= new Anthropic();
  return client;
}

/**
 * Few-shot corpus. Two full owner-approved arcs — enough to carry the voice,
 * the Notice→Act→Become progression, and the success-message register, while
 * staying inside a cacheable prefix.
 */
function exemplars(): string {
  const picked = [
    content.breakIt.categories[0],
    content.powerUp.categories[0],
  ];
  return picked
    .filter((c) => c.journey)
    .map((c) => {
      const lines = c.journey!
        .map(
          (d, i) =>
            `Day ${i + 1} | ${d.affirmation} | ${d.successMessage}`,
        )
        .join("\n");
      return `### Approved arc: "${c.name}"\n${lines}`;
    })
    .join("\n\n");
}

const RULES = `You write 21-day affirmation arcs for Say This With Me.

The user speaks each day's line OUT LOUD and speech recognition verifies it word
for word. Everything follows from that: lines must be natural to say, not to read.

VOICE AND SHAPE — non-negotiable:
- Exactly 21 days, in a progression: days 1-7 Notice (awareness, catching the
  pattern), days 8-14 Act (deliberate choices, small wins), days 15-21 Become
  (identity-level statements).
- Each affirmation is FIRST PERSON, PRESENT TENSE, and at most 12 words.
- Concrete and speakable. No abstraction, no jargon, no metaphor stacking.
- Each success message is one short line of earned praise — warm, specific to
  what they just said, never generic congratulation.

HONEST SCIENCE — the brand rule, and a hard constraint:
- Never claim a mechanism we cannot support. No "rewires your brain", no
  "21 days forms a habit", no neuroscience, no manifestation or attraction
  language, no promises about outcomes.
- The arc gives ACTIONS, never OUTCOMES. You are writing what someone does,
  not what they will get.
- No medical, clinical or therapeutic claims.

The guide sending these lines cannot tell the user how things turn out — only
what to do next. Write every line as something they can act on today.`;

export interface ArcRequest {
  domain: DomainKey;
  goal: string;
  horizon: HorizonKey;
}

export interface ArcResult {
  days: ArcDay[];
  /**
   * Total prompt size. `usage.input_tokens` alone is only the *uncached
   * remainder* — with the exemplar prefix cached it reads as ~84 tokens for a
   * ~2k-token prompt, which would badly under-report cost.
   */
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

/**
 * Generates a personal 21-day arc. Throws on failure so the caller can record
 * the job as failed rather than persisting a malformed arc.
 */
export async function generateArc(req: ArcRequest): Promise<ArcResult> {
  const anthropic = getClient();
  if (!anthropic) throw new Error("Arc generation is not configured.");

  const domain = DOMAINS[req.domain];
  const goal = req.goal.trim() || domain.example;

  const response = await anthropic.messages.parse({
    model: "claude-opus-5",
    // Thinking is on by default on Opus 5 and max_tokens caps thinking plus
    // output together, so this is sized well above the visible arc.
    max_tokens: 16000,
    output_config: {
      effort: "high",
      format: zodOutputFormat(arcSchema),
    },
    system: [
      {
        type: "text",
        text: `${RULES}\n\n## Approved arcs — match this voice exactly\n\n${exemplars()}`,
        // The rules + exemplars are identical for every user, so they cache.
        // Opus 5's minimum cacheable prefix is 512 tokens; this clears it by
        // a wide margin.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Write the 21-day arc for this person.

Part of life: ${domain.label} — ${domain.prompt}
What they want to have done: ${goal}
How far ahead they are picturing: ${horizonLabel(req.horizon)}

Return exactly 21 days.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The request was declined.");
  }
  if (!response.parsed_output) {
    // Either the model returned fewer than 21 days or the shape did not
    // validate. Fail loudly — a short arc silently breaks the 7/21 contract.
    throw new Error("Arc did not validate against the 21-day schema.");
  }

  const u = response.usage;
  const cacheRead = u.cache_read_input_tokens ?? 0;
  const cacheWrite = u.cache_creation_input_tokens ?? 0;
  return {
    days: response.parsed_output.days,
    inputTokens: u.input_tokens + cacheRead + cacheWrite,
    outputTokens: u.output_tokens,
    cachedTokens: cacheRead,
  };
}
