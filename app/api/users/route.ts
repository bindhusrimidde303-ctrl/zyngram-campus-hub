import { addAudit, publicUser, readStore, writeStore, type Role } from "@/lib/db";
import { requireRole } from "@/lib/server-auth";
export async function GET() {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  return Response.json({ users: auth.current.store.users.map(publicUser) });
}
export async function PATCH(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  try {
    const body = await request.json();
    const id = String(body.id || "");
    const role = String(body.role || "") as Role;
    if (!["student", "trainer", "coordinator", "admin"].includes(role)) return Response.json({ error: "Invalid role." }, { status: 400 });
    const store = readStore();
    const user = store.users.find((u) => u.id === id);
    if (!user) return Response.json({ error: "User not found." }, { status: 404 });
    if (user.id === auth.current.user.id && role !== "admin") return Response.json({ error: "You cannot remove your own administrator access." }, { status: 400 });
    user.role = role;
    addAudit(store, auth.current.user.email, `Changed ${user.email} role to ${role}`);
    writeStore(store);
    return Response.json({ user: publicUser(user) });
  } catch { return Response.json({ error: "Unable to update role." }, { status: 500 }); }
}
