import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ListNameProvider } from "@/context/ListNameContext";
import { getListName } from "@/lib/listName";
import WordBuilderGameNew from "@/components/WordBuilderGameNew";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { getUserDetails } from "@/app/actions/getUserDetails";
import { User } from "@prisma/client";
import NoWordsModal from "@/components/NoWordsModal";
import { shuffleArray } from "@/lib/shuffle";
import { getWordBuilderSources } from "@/lib/gameWords";
import { toWordBuilderWord } from "@/data/wordBuilderData";
import { requireListOwnerForPage } from "@/lib/requireSession";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  // The list name and the list's words start before the ownership check so they run in
  // parallel with it. The check is still awaited first (a non-owner gets notFound() as
  // before, and the early results are discarded); the session and user lookups stay after it.
  const listNamePromise = getListName(parseInt(listId));
  const listWordsPromise = getWordBuilderSources(parseInt(listId));
  listNamePromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  listWordsPromise.catch(() => {
    // Same as above
  });
  await requireListOwnerForPage(parseInt(listId));
  // The game plays the child's own words from this list (not a built-in word set)
  const session = (await auth()) as Session | null;
  const user = session?.user as User;
  // getUserDetails is cached per request, so DashboardLayout reuses this lookup;
  // the list name and words were started above
  const [userData, listName, listWords] = await Promise.all([
    user?.id ? getUserDetails(user.id) : undefined,
    listNamePromise,
    listWordsPromise,
  ]);
   
  // Determine age group and mode based on user's grade
  // This implements the age-aligned Word Builder modes as specified:
  // - PreK-1st Grade: Picture Builder (Ages 4-6) - Big images, simple words
  // - 1st-3rd Grade: Phonics Builder (Ages 6-8) - Digraphs, phoneme audio
  // - 4th-6th Grade: Syllable Builder (Ages 9-11) - Multi-syllable words
  // - 7th+ Grade: Morphology Builder (Ages 11-13+) - Root words + prefixes/suffixes
  const getAgeGroupAndMode = (grade: string | null | undefined) => {
    if (!grade) {
      // Default for users without grade data
      return {
        ageGroup: '6-8' as const,
        mode: 'picture' as const,
        difficulty: 'medium' as const
      };
    }

    const gradeNum = parseInt(grade.replace(/\D/g, '')) || 1; // Extract number from grade (e.g., "1st" -> 1)
    // Ages 4-6: Picture Builder (Grades PreK-1st)
    if (gradeNum <= 1) {
      return {
        ageGroup: '4-6' as const,
        mode: 'picture' as const,
        difficulty: 'hard' as const
      };
    }
    // Ages 6-8: Phonics Builder (Grades 1st-3rd)
    else if (gradeNum <= 3) {
      return {
        ageGroup: '6-8' as const,
        mode: 'phonics' as const,
        difficulty: 'medium' as const
      };
    }
    // Ages 9-11: Syllable Builder (Grades 4th-6th)
    else if (gradeNum < 6) {
      return {
        ageGroup: '9-11' as const,
        mode: 'syllable' as const,
        difficulty: 'medium' as const
      };
    }
    // Ages 11-13+: Morphology Builder (Grades 7th+)
    else {
      return {
        ageGroup: '11-13+' as const,
        mode: 'morphology' as const,
        difficulty: 'hard' as const
      };
    }
  };

  const { ageGroup, mode, difficulty } = getAgeGroupAndMode(userData?.grade);
  // Word order is shuffled on every page load
  const words = shuffleArray(listWords).map((listWord) =>
    toWordBuilderWord(listWord, { ageGroup, mode, difficulty })
  );
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={listName}>
        {words.length > 0 ? (
          <WordBuilderGameNew
            listId={listId}
            ageGroup={ageGroup}
            mode={mode}
            difficulty={difficulty}
            words={words}
          />
        ) : (
          <NoWordsModal
            isOpen={true}
            title="No Words Available"
            message="This list doesn't have any words yet. Please go back and add some first."
          />
        )}
      </ListNameProvider>
    </DashboardLayout>
  );
}

export default page;
