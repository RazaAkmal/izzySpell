import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Placeholder, Section } from "@/components/legal/LegalPage";

// DRAFT - pending legal review. Content is derived from what the app actually does
// (see docs/LEGAL_REVIEW_NOTES.md). Placeholders mark facts that are still missing.

export const metadata: Metadata = {
  title: "Privacy Policy - IzzySpell",
  description: "How IzzySpell collects, uses and shares information about its users.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <Section title="Who we are">
        <p>
          IzzySpell is a spelling practice app. It is operated by <Placeholder>[COMPANY LEGAL NAME]</Placeholder>,{" "}
          <Placeholder>[COMPANY ADDRESS]</Placeholder>. You can contact us about privacy at{" "}
          <Placeholder>[CONTACT EMAIL]</Placeholder>.
        </p>
      </Section>

      <Section title="Creating an account">
        <p>
          When creating an IzzySpell account, the account holder agrees to the Terms of Service and this policy. We record
          when that consent was given and which version of the texts it applied to.
        </p>
        <p>We do not collect payment card details.</p>
      </Section>

      <Section title="What information we collect">
        <p className="font-semibold">Account information</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>A username.</li>
          <li>A password. We store only a one-way hash of it, never the password itself.</li>
          <li>The account&apos;s email address (stored in lower case).</li>
          <li>When consent was given and the version of the consent texts.</li>
          <li>When the password was last changed (used to sign out other devices after a password reset).</li>
        </ul>
        <p className="font-semibold">Profile</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>First name and last name.</li>
          <li>Age range (for example &quot;8-9&quot;) and school grade.</li>
          <li>An optional profile picture.</li>
        </ul>
        <p className="font-semibold">Learning content and activity</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Spelling lists: list names and words, whether typed in or taken from an uploaded file or photo. The uploaded file
            or photo itself is only used to read the words; we keep the words, not the file.
          </li>
          <li>
            Practice material generated for each list (syllable exercises, word groups, flash cards with short definitions and
            example sentences, scrambled-word games) and suggested quiz time limits.
          </li>
          <li>
            Progress and results: which words and exercises were completed, quiz scores and times, and the words that were
            spelled wrong in a quiz together with the answer that was typed.
          </li>
        </ul>
        <p className="font-semibold">Password reset</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            When a password reset is requested, we email a one-time link to the email address on file. We store only a hash of
            the code in that link, together with when it was created, when it expires (after 60 minutes) and whether it was used.
          </li>
        </ul>
        <p className="font-semibold">Technical information</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Our servers keep technical logs. Some log entries can include an account identifier and the user&apos;s age range
            and grade (for example when quiz time limits are suggested).
          </li>
          <li>
            The app stores a few small settings in the browser&apos;s local storage on your device (for example the best time in
            the Word Builder game). These stay on the device and are not sent to us.
          </li>
        </ul>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc pl-6 space-y-1">
          <li>To create and run the account and let the user sign in.</li>
          <li>To turn word lists into spelling practice, quizzes and games, and to show progress.</li>
          <li>To send password reset emails to the email address on the account.</li>
          <li>To keep accounts secure (for example, ending other sessions after a password change).</li>
          <li>To record consent.</li>
        </ul>
        <p>We do not show advertising and we do not sell personal information.</p>
      </Section>

      <Section title="Who we share it with">
        <p>We use these service providers to run IzzySpell. Each receives only what it needs for its task:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Vercel</strong> - hosts the app and its server logs.
          </li>
          <li>
            <strong>Neon</strong> - hosts the database where account, profile and learning information is stored.
          </li>
          <li>
            <strong>OpenAI</strong> - receives the words of spelling lists (and the text read from uploaded files) to check
            the words and create practice material, and receives the user&apos;s grade and age range together with list words
            to suggest quiz time limits.
          </li>
          <li>
            <strong>Amazon Web Services (Textract)</strong> - receives photos of word lists to read the words from them.
          </li>
          <li>
            <strong>Supabase</strong> - stores optional profile pictures.
          </li>
          <li>
            <strong>Resend</strong> - sends password reset emails; receives the account&apos;s email address, the
            username and the reset link.
          </li>
        </ul>
        <p>
          Words are read aloud using the text-to-speech feature built into your browser or device. Depending on the browser
          and device, the provider of that feature may process the word being spoken.
        </p>
        <p>
          Information is stored and processed in <Placeholder>[DATA HOSTING LOCATIONS / COUNTRIES]</Placeholder>.{" "}
          <Placeholder>[INFORMATION ABOUT INTERNATIONAL TRANSFERS, IF ANY]</Placeholder>
        </p>
        <p>
          We may also disclose information if required by law. <Placeholder>[ANY OTHER DISCLOSURES]</Placeholder>
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          IzzySpell uses cookies only to sign in and keep you signed in: a session cookie, a security (CSRF) cookie and a
          cookie that remembers where to return after signing in. We do not use advertising or analytics cookies.
        </p>
      </Section>

      <Section title="How long we keep information">
        <p>
          Account, profile and learning information is kept for as long as the account exists. Spelling lists can be deleted
          in the app at any time; deleting a list also deletes its words, practice material and quiz results.
        </p>
        <p>
          <Placeholder>[RETENTION PERIOD]</Placeholder> - for inactive accounts, server logs, used or expired password reset
          records, and backups.
        </p>
        <p>
          Earlier versions of IzzySpell asked for payment card details during sign-up. We no longer collect them.{" "}
          <Placeholder>[STATUS OF PREVIOUSLY STORED CARD DETAILS]</Placeholder>
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask to see the information we hold about your account, to correct it, or to delete the account and its
          information, by emailing <Placeholder>[CONTACT EMAIL]</Placeholder>. We may need to confirm that the request comes
          from the account holder. <Placeholder>[RESPONSE TIME FOR REQUESTS]</Placeholder>
        </p>
        <p>
          Profile details can also be changed in the app under &quot;My Profile&quot;. An email can be added there if the
          account does not have one yet; to change an existing email, contact us.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Passwords are stored only as one-way hashes. Password reset links work once and expire after 60 minutes, and only a
          hash of the code in the link is stored. After a password is reset, other signed-in sessions are ended. No method of
          storing or sending information is completely secure.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          The date at the top shows when this policy was last updated. <Placeholder>[HOW USERS WILL BE TOLD ABOUT CHANGES]</Placeholder>
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <Placeholder>[COMPANY LEGAL NAME]</Placeholder> - <Placeholder>[CONTACT EMAIL]</Placeholder>
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="font-bold underline">
            Terms of Service
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
