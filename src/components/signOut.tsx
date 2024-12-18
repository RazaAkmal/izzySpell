import { handleSignOut } from "@/app/actions/handleSignout";

export function SignOut() {
  return (
    <form
      action={async () => {
        await handleSignOut();
      }}
    >
      <button
        type="submit"
        className="block px-4 py-1 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-black"
      >
        Sign Out
      </button>
    </form>
  );
}
