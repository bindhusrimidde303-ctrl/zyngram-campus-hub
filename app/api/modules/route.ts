import { randomBytes } from "node:crypto";
import { addAudit, readStore, writeStore, type ModuleItem } from "@/lib/db";
import { requireRole } from "@/lib/server-auth";
export async function GET() {
  const auth = await requireRole(["student", "trainer", "coordinator", "admin"]);
  if ("error" in auth) return auth.error;
  return Response.json({ modules: auth.current.store.modules });
}
export async function POST(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "General").trim();
    const status = body.status === "draft" ? "draft" : "active";
    if (title.length < 2 || title.length > 120) return Response.json({ error: "Title must be between 2 and 120 characters." }, { status: 400 });
    if (description.length > 2000) return Response.json({ error: "Description is too long." }, { status: 400 });
    const now = new Date().toISOString();
    const moduleItem: ModuleItem = { id: randomBytes(12).toString("hex"), title, description, category, status, createdAt: now, updatedAt: now };
    const store = readStore(); store.modules.unshift(moduleItem);
    addAudit(store, auth.current.user.email, `Created module: ${title}`); writeStore(store);
    return Response.json({ module: moduleItem }, { status: 201 });
  } catch { return Response.json({ error: "Unable to create module." }, { status: 500 }); }
}
export async function PATCH(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  try {
    const body = await request.json();
    const store = readStore();
    const moduleItem = store.modules.find((m) => m.id === String(body.id || ""));
    if (!moduleItem) return Response.json({ error: "Module not found." }, { status: 404 });
    if (body.title !== undefined) moduleItem.title = String(body.title).trim().slice(0, 120);
    if (body.description !== undefined) moduleItem.description = String(body.description).trim().slice(0, 2000);
    if (body.category !== undefined) moduleItem.category = String(body.category).trim().slice(0, 80);
    if (body.status !== undefined) {
      if (!["active", "draft"].includes(body.status)) return Response.json({ error: "Invalid status." }, { status: 400 });
      moduleItem.status = body.status;
    }
    moduleItem.updatedAt = new Date().toISOString();
    addAudit(store, auth.current.user.email, `Updated module: ${moduleItem.title}`); writeStore(store);
    return Response.json({ module: moduleItem });
  } catch { return Response.json({ error: "Unable to update module." }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Module id is required." }, { status: 400 });
  const store = readStore();
  const existing = store.modules.find((m) => m.id === id);
  if (!existing) return Response.json({ error: "Module not found." }, { status: 404 });
  store.modules = store.modules.filter((m) => m.id !== id);
  addAudit(store, auth.current.user.email, `Deleted module: ${existing.title}`); writeStore(store);
  return Response.json({ message: "Module deleted." });
}
