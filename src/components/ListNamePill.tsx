import React from "react";
import Image from "next/image";

// The "book + list name" label at the top of every practice screen. A label, not a button.
// Dark green so the white text passes WCAG AA contrast.
const ListNamePill: React.FC<{ listName?: string | null }> = ({ listName }) => (
  <div
    className="inline-flex items-center gap-2 max-w-full bg-deepGreen text-white rounded-full border-2 border-white pl-1.5 pr-4 py-1 shadow-[2px_2px_0px_rgba(0,0,250,0.4)]"
    title={listName ? `List name: ${listName}` : undefined}
  >
    <Image src="/images/bookIcon.svg" alt="" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
    <span className="truncate text-sm sm:text-base font-semibold">
      <span className="sr-only">List: </span>
      {listName}
    </span>
  </div>
);

export default ListNamePill;
