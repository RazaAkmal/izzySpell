import { handleSignOut } from "@/app/actions/handleSignout";

export function SignOut({ focusStyle }: { focusStyle?: boolean }) {
  return (
    <form
      action={async () => {
        await handleSignOut();
      }}
    >
      <button
        type="submit"
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-bold transition-colors ${focusStyle ? "bg-red-50 text-red-500" : "text-red-400 hover:bg-red-50 hover:text-red-500"}`}
      >
        <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-base flex-shrink-0">🚪</span>
        <span className="text-sm">Sign Out</span>
      </button>
    </form>
  );
}
