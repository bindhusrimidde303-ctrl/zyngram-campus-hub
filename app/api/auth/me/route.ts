import { currentUser } from "@/lib/server-auth";
export async function GET() {
  const current = await currentUser();
  if (!current) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: current.publicUser });
}
