import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalList, LegalSection } from "@/components/site/legal-doc";
import {
  CONTACT_EMAIL,
  LEGAL_LOCATION,
  LEGAL_OPERATOR,
  LEGAL_UPDATED,
  POSTHOG_ENABLED,
  SITE_URL,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Say This With Me collects, why, how long it's kept, and how to have it deleted.",
  alternates: { canonical: `${SITE_URL}/legal/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated={LEGAL_UPDATED}
      lede={`${LEGAL_OPERATOR} is an independent solo project operated from ${LEGAL_LOCATION}. This explains what we collect, why, and how to get it removed. We don't sell data and we don't run ads.`}
    >
      <LegalSection heading="1. Your voice is never sent to us">
        <p>
          This is the part people ask about first, so it comes first. Your audio
          never reaches our servers and we never store a recording of you.
          Speech recognition is performed by your browser&apos;s own built-in
          speech service. Depending on which browser you use, that service may
          send your audio to the browser maker&apos;s servers to be converted
          into text — Chrome, for example, uses Google&apos;s speech servers.
          That processing is governed by your browser&apos;s privacy policy, not
          ours. If you would rather not use speech recognition at all, every
          exercise has a typing fallback.
        </p>
        <p>
          What we receive is the result: whether the words matched, and a score.
          Not the audio.
        </p>
      </LegalSection>

      <LegalSection heading="2. What we collect">
        <LegalList>
          <li>
            <b>Account.</b> If you sign in with Google we receive your email
            address, your name, and a user id. We never receive your Google
            password and we get no access to your Google account or any other
            Google service.
          </li>
          <li>
            <b>Practice data.</b> Completed affirmations (the text, mode,
            category, match score, number of attempts, whether you spoke or
            typed, and the time), your streak, your stars, your journey
            progress, and your favorites.
          </li>
          <li>
            <b>Display name.</b> Only if you set one on your account page.
          </li>
          <li>
            <b>Email address.</b> If you submit the signup form on the home
            page, we store that address so we can email you about the app.
          </li>
          <li>
            <b>Technical.</b> Standard server logs from our host (IP address,
            browser, timestamps, error traces), kept briefly for security and
            debugging.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="3. If you don't sign in">
        <p>
          The app works fully without an account. In that case your streak,
          stars, journeys, favorites and completion history are stored only in
          your own browser&apos;s local storage — they never leave your device
          and we cannot see them. Clearing your browser data erases them, and we
          have no copy to restore.
        </p>
        <p>
          Signing in is what turns that local history into a synced account: the
          first time you sign in, the data already on your device is uploaded and
          merged with anything already in your account.
        </p>
      </LegalSection>

      <LegalSection heading="4. Why we collect it">
        <p>
          To run the thing you asked for: to keep your streak accurate across
          devices, to show your journey progress, and to remember your favorites.
          Aggregate, non-identifying counts help us understand which categories
          people actually use. That is the whole list. We do not build
          advertising profiles and we do not sell or rent your data to anyone.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who processes it">
        <LegalList>
          <li>
            <b>Supabase</b> — database, authentication and hosting of your
            account data.
          </li>
          <li>
            <b>Vercel</b> — application hosting and server logs.
          </li>
          <li>
            <b>Google</b> — sign-in (if you use it), and Google Analytics for
            aggregate usage measurement.
          </li>
          {POSTHOG_ENABLED && (
            <li>
              <b>PostHog</b> — product analytics, used to see which parts of the
              app people return to.
            </li>
          )}
        </LegalList>
        <p>
          These providers process data on our behalf under their own terms. This
          project is operated from {LEGAL_LOCATION}, and data may be processed in
          the United States.
        </p>
      </LegalSection>

      <LegalSection heading="6. How long we keep it">
        <p>
          Account and practice data are kept until you delete your account.
          Deleting it removes everything immediately and permanently — your
          profile, sessions, streak, stars, journeys and favorites — through a
          cascade in the database, not a flag. Practice data saved on your own
          device stays on your device; clear your browser data to remove it.
          Email addresses given to the signup form are kept until you ask us to
          remove them. Server logs are short-lived.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your choices">
        <LegalList>
          <li>
            <b>Delete everything</b> yourself, at any time, from{" "}
            <Link href="/account" className="underline underline-offset-4 hover:text-foreground">
              your account page
            </Link>
            . No email to us required.
          </li>
          <li>
            <b>Use the app without an account</b>, in which case nothing of
            yours reaches our servers at all.
          </li>
          <li>
            <b>Ask us anything</b> — access, correction, or removal — at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="8. Children">
        <p>
          This app isn&apos;t directed at children under 13, and we don&apos;t
          knowingly collect their data. If you believe a child has given us
          information, email us and we&apos;ll remove it.
        </p>
      </LegalSection>

      <LegalSection heading="9. Changes">
        <p>
          If this policy changes materially we&apos;ll update the date at the top
          of this page. Continuing to use the app after a change means you accept
          the updated policy.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          {LEGAL_OPERATOR}, {LEGAL_LOCATION} —{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
