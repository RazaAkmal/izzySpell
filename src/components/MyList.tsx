import { getColorForProgress } from "@/app/utils/colors";
import { SpellingListItem } from "@/lib/defination";
import ClientList from "./ClientList";

async function fetchSpellingLists(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; 
  const response = await fetch(`${baseUrl}/api/spelling-list?userId=${userId}`, {
    cache: 'no-store'
  });
  const { spellingLists } = await response.json();
  return (
    spellingLists?.map((item: SpellingListItem) => ({
      ...item,
      color: getColorForProgress(item.progress),
    })) || []
  );
}



const List = async ({ user }: { user: any }) => {
  const spellingLists = await fetchSpellingLists(user.id);

  return (
    <div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
      {/* Pass data to client component */}
      <ClientList spellingLists={spellingLists} />
    </div>
  );
};

export default List;
