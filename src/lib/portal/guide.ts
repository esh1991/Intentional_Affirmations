import { content } from "@/lib/content";
import { DOMAINS, type DomainKey } from "@/lib/portal/domains";

/**
 * What the guide is cleared to send.
 *
 * The restriction is the product (docs/roadmap/phase-3-portal.md, decision 10).
 * Every line here obeys three rules, and generated lines in M4 inherit them via
 * the prompt:
 *
 *   1. Name the obstacle — warmth plus friction, never warmth alone. Positive
 *      fantasy on its own drains the effort to chase it.
 *   2. Hand over an action for today, never the outcome. They cannot tell you
 *      how it turns out; that is the whole conceit and the whole honesty.
 *   3. Never name the authority. "Those are not the rules" carries it. A named
 *      body invites lore bloat and drifts toward existing franchises.
 *
 * ⚠️ Owner-approval note: this is copy written in-session, not from the
 * owner-approved content library. The *promise* handed to the user is pulled
 * from that library (see promiseFor); only the guide's framing is new.
 */

export interface GuideMessage {
  /** Said before the withheld part. */
  before: string;
  /** Rendered as a struck block — shown, never described. */
  redacted: string;
  /** The part they are allowed to send: always an action, never an outcome. */
  after: string;
}

const MESSAGES: Record<DomainKey, GuideMessage> = {
  body: {
    before: "I could tell you what",
    redacted: "the morning it clicks",
    after:
      " feels like. Those are not the rules. What I can give you is this: it started on a day you did not want to get up.",
  },
  craft: {
    before: "I could tell you how",
    redacted: "the whole thing turns out",
    after:
      ", but they will not let me send that. What I can give you is the hour you stopped waiting to feel ready.",
  },
  wealth: {
    before: "I could tell you",
    redacted: "the number you end up with",
    after:
      ". That is exactly the part I am not allowed to send. What I can send is the evening you finally opened it and looked.",
  },
  calm: {
    before: "I could tell you which night",
    redacted: "the noise finally stops",
    after:
      ", but that is not mine to give. What I can give you is the moment you stopped arguing with yourself at two in the morning.",
  },
  connection: {
    before: "I could tell you who",
    redacted: "is still sitting at that table",
    after:
      ". Those are not the rules either. What I can tell you is the day you put the phone face down and stayed.",
  },
};

export function guideMessage(domain: DomainKey): GuideMessage {
  return MESSAGES[domain];
}

export interface Promise_ {
  affirmation: string;
  successMessage: string;
  /** Where it came from, so the practice hand-off can deep-link correctly. */
  mode: string;
  category: string;
}

/**
 * The line they are cleared to pass on.
 *
 * Pulled from the owner-approved library rather than invented: until M4
 * generates a personal arc, the honest move is to hand over real approved
 * content via the domain's bridge mode. Day 1 of the arc is always a "Notice"
 * entry, which is exactly the right altitude for a first contact.
 */
export function promiseFor(domain: DomainKey): Promise_ {
  const mode = DOMAINS[domain].bridgeMode;
  const category = content[mode].categories[0];
  const entry = category.journey?.[0] ?? category.items[0];
  return {
    affirmation: entry.affirmation,
    successMessage: entry.successMessage,
    mode,
    category: category.name,
  };
}
