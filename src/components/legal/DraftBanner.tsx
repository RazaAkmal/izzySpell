// "Draft - pending legal review" banner for the Terms and Privacy pages.
// To remove it once the texts are approved: set SHOW_LEGAL_DRAFT_BANNER to false
// (or delete this component and its two usages in LegalPage.tsx).
export const SHOW_LEGAL_DRAFT_BANNER = true;

export default function DraftBanner() {
  if (!SHOW_LEGAL_DRAFT_BANNER) return null;
  return (
    <div
      role="note"
      className="w-full mb-6 rounded-xl border-2 border-dashed border-orange bg-orange/10 px-4 py-3 text-center font-bold text-darkOrange"
    >
      Draft - pending legal review
    </div>
  );
}
