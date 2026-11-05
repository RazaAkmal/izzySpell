"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUserId } from "@/lib/requireSession";

export const revalidateRoute = async (path: string) => {
  await requireSessionUserId();
  revalidatePath(path);
};