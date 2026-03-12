import { auth } from "@clerk/nextjs/server";

export async function getUserIdOrNull() {
  if (process.env.E2E_TEST === "1") return process.env.E2E_USER_ID ?? "e2e_user";
  const { userId } = await auth();
  return userId;
}

export async function requireUserId() {
  const userId = await getUserIdOrNull();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}