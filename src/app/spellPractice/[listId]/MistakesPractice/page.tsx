import { Suspense } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MistakesModePractice from "@/components/MistakesModePractice";
import LoadingComponent from "@/components/LoadingComponent";
import { ListNameProvider } from "@/context/ListNameContext";
import DashboardLayout from "@/components/DashboardLayout";
import { getRecentQuizMistakes } from "@/app/actions/getRecentQuizMistakes";

export default async function MistakesPracticePage({ params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const listId = (await params).listId;
  const userId = session.user.id;

  // Check if list exists and belongs to user
  const list = await prisma.spellingList.findUnique({
    where: {
      id: parseInt(listId),
      userId: userId,
    },
  });

  if (!list) {
    redirect("/lists");
  }

  // Fetch mistakes using the server action
  const formattedMistakes = await getRecentQuizMistakes(parseInt(listId));

  return (
    <Suspense fallback={<LoadingComponent />}>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
          <MistakesModePractice 
            listId={listId} 
            initialMistakes={formattedMistakes} 
          />
        </ListNameProvider>
      </DashboardLayout>
    </Suspense>
  );
}
