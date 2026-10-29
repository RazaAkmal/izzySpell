import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Placeholder, Section } from "@/components/legal/LegalPage";

// DRAFT - pending legal review. Placeholders mark facts that are still missing
// (see docs/LEGAL_REVIEW_NOTES.md).

export const metadata: Metadata = {
  title: "Terms of Service - IzzySpell",
  description: "The terms for using IzzySpell, a spelling practice app for children, set up by a parent or legal guardian.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <Section title="About these terms">
        <p>
          These terms apply to IzzySpell, a spelling practice app for children, operated by{" "}
          <Placeholder>[COMPANY LEGAL NAME]</Placeholder>. By creating an account, the parent or legal guardian agrees to these
          terms and to our{" "}
          <Link href="/privacy" className="font-bold underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Who may create an account">
        <p>
          Accounts must be created by a parent or legal guardian of the child who will use them. The parent or guardian is
          responsible for the account and for the child&apos;s use of IzzySpell. <Placeholder>[AGE RANGE OF CHILDREN THE SERVICE IS FOR]</Placeholder>
        </p>
        <p>
          The parent or guardian must provide a working email address for themselves. Password reset links are sent only to
          that address.
        </p>
      </Section>

      <Section title="Your account">
        <ul className="list-disc pl-6 space-y-1">
          <li>Keep the password private and choose one that is not used elsewhere.</li>
          <li>Keep the parent email up to date so a password can be reset if it is forgotten.</li>
          <li>Tell us at <Placeholder>[CONTACT EMAIL]</Placeholder> if you think someone else has accessed the account.</li>
        </ul>
      </Section>

      <Section title="Acceptable use">
        <p>When using IzzySpell, you agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>upload anything other than word lists for spelling practice, or anything you do not have the right to use;</li>
          <li>upload other people&apos;s personal information;</li>
          <li>try to access other people&apos;s accounts or information;</li>
          <li>interfere with, overload or try to break the service, or use automated tools to access it;</li>
          <li>use IzzySpell for anything unlawful.</li>
        </ul>
      </Section>

      <Section title="Learning content">
        <p>
          Practice material such as syllable splits, word groups, definitions, example sentences and suggested quiz times is
          generated automatically, partly with artificial intelligence. It may contain mistakes; please check anything that
          looks wrong.
        </p>
      </Section>

      <Section title="Fees">
        <p>
          IzzySpell does not collect payment details. <Placeholder>[PRICING / FEES, IF ANY]</Placeholder>
        </p>
      </Section>

      <Section title="Ending your account">
        <p>
          You can stop using IzzySpell at any time and ask us to delete the account by emailing{" "}
          <Placeholder>[CONTACT EMAIL]</Placeholder>. We may suspend or close an account that breaks these terms.{" "}
          <Placeholder>[NOTICE PERIOD / PROCESS FOR SUSPENSION OR CLOSURE]</Placeholder>
        </p>
      </Section>

      <Section title="Disclaimer">
        <p>
          IzzySpell is provided &quot;as is&quot; and &quot;as available&quot;. We work to keep it available and accurate,
          but we cannot promise that it will always be available or free of errors.{" "}
          <Placeholder>[LIMITATION OF LIABILITY WORDING]</Placeholder>
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          The date at the top shows when these terms were last updated.{" "}
          <Placeholder>[HOW PARENTS WILL BE TOLD ABOUT CHANGES]</Placeholder>
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          <Placeholder>[GOVERNING LAW / JURISDICTION]</Placeholder>
        </p>
      </Section>

      <Section title="Contact">
        <p>
          <Placeholder>[COMPANY LEGAL NAME]</Placeholder>, <Placeholder>[COMPANY ADDRESS]</Placeholder> -{" "}
          <Placeholder>[CONTACT EMAIL]</Placeholder>
        </p>
      </Section>
    </LegalPage>
  );
}
