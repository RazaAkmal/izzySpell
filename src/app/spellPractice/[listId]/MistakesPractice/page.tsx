import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MistakesModePractice from "@/components/MistakesModePractice";
import { ListNameProvider } from "@/context/ListNameContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getRecentQuizMistakes } from "@/app/actions/getRecentQuizMistakes";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";

export default async function MistakesPracticePage({ params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const listId = (await params).listId;
  const userId = session.user.id;

  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();

  // Check the list and fetch its mistakes at the same time (previously one after the other).
  // The mistakes result is only used after the ownership check below.
  const [list, mistakesResult] = await Promise.all([
    // Check if list exists and belongs to user
    prisma.spellingList.findUnique({
      where: {
        id: parseInt(listId),
        userId: userId,
      },
    }),
    // Fetch mistakes using the server action; settle so a failure is raised after the check
    getRecentQuizMistakes(parseInt(listId)).then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error })
    ),
  ]);

  if (!list) {
    redirect("/lists");
  }

  if (!mistakesResult.ok) {
    throw mistakesResult.error;
  }
  const formattedMistakes = mistakesResult.value;

  return (
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={list.listName}>
          <MistakesModePractice 
            listId={listId} 
            initialMistakes={formattedMistakes} 
          />
        </ListNameProvider>
      </DashboardLayout>
  );
}
