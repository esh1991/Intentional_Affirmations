import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalList, LegalSection } from "@/components/site/legal-doc";
import {
  CONTACT_EMAIL,
  LEGAL_LOCATION,
  LEGAL_OPERATOR,
  LEGAL_UPDATED,
  SITE_URL,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms you agree to when you use Say This With Me.",
  alternates: { canonical: `${SITE_URL}/legal/terms` },
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated={LEGAL_UPDATED}
      lede={`Plain terms for a small app. Using ${LEGAL_OPERATOR} means agreeing to these.`}
    >
      <LegalSection heading="1. What this is">
        <p>
          {LEGAL_OPERATOR} is a practice tool: you speak an affirmation out loud,
          your browser&apos;s speech recognition checks the words, and the app
          tracks streaks, stars and journeys to keep you coming back. It is
          operated as an independent solo project from {LEGAL_LOCATION}.
        </p>
      </LegalSection>

      <LegalSection heading="2. This is not health care">
        <p>
          <b>
            This app is a self-improvement tool, not a substitute for
            professional mental-health care.
          </b>{" "}
          It does not diagnose, treat or prevent any condition, and nothing in it
          is medical or psychological advice. If you are struggling, please talk
          to a qualified professional. If you are in crisis, contact your local
          emergency services or a crisis line immediately.
        </p>
        <p>
          We describe the research behind spoken practice honestly on{" "}
          <Link href="/science" className="underline underline-offset-4 hover:text-foreground">
            The Science
          </Link>{" "}
          page. We make no promise about results.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <p>
          Signing in is optional — the app works without it. If you do sign in,
          you&apos;re responsible for the Google account you use. You can delete
          your account and all synced data at any time from{" "}
          <Link href="/account" className="underline underline-offset-4 hover:text-foreground">
            your account page
          </Link>
          . We may suspend accounts that are used to attack, abuse or overload
          the service.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <LegalList>
          <li>Don&apos;t attempt to break, overload, or probe the service.</li>
          <li>Don&apos;t scrape or resell the content.</li>
          <li>Don&apos;t use the app to harass anyone or to break the law.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="5. Content">
        <p>
          The affirmations, journey arcs, illustrations, copy and design are ours
          and are provided for your personal use. Your practice data is yours;
          you can delete it whenever you like.
        </p>
      </LegalSection>

      <LegalSection heading="6. Availability">
        <p>
          The app is free and provided as-is. There is no uptime guarantee, and
          features may change or be withdrawn. Speech recognition in particular
          depends on your browser: it works best in Chrome and other Chromium
          browsers, is unreliable in Safari on iOS, and is absent in Firefox.
          The typing fallback exists for exactly that reason.
        </p>
      </LegalSection>

      <LegalSection heading="7. Liability">
        <p>
          To the fullest extent the law allows, {LEGAL_OPERATOR} is provided
          without warranties of any kind, and we are not liable for any indirect
          or consequential loss arising from your use of it.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes and contact">
        <p>
          If these terms change materially we&apos;ll update the date at the top
          of this page. Questions go to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {CONTACT_EMAIL}
          </a>
          . See also our{" "}
          <Link
            href="/legal/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
