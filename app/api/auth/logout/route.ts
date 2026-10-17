import { cookies } from "next/headers";
import { readStore, writeStore } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campus_session")?.value;
  if (token) {
    const store = readStore();
    store.sessions = store.sessions.filter((s) => s.token !== token);
    writeStore(store);
  }
  const response = Response.json({ message: "Signed out." });
  response.headers.append("Set-Cookie", "campus_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
  return response;
}
