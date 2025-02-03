import { auth } from "@/app/_lib/auth";

export async function GET(req) {
  const session = await auth();
  return Response.json({ userId: session?.user?.userId });
}
