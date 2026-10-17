
import { randomBytes } from "node:crypto";
import {
  addAudit,
  readStore,
  writeStore,
  type ModuleItem,
} from "@/lib/db";
import { sql } from "@/lib/neon";
import { requireRole } from "@/lib/server-auth";

export async function GET() {
  const auth = await requireRole([
    "student",
    "trainer",
    "coordinator",
    "admin",
  ]);

  if ("error" in auth) return auth.error;

  try {
    const store = await readStore();
    return Response.json({ modules: store.modules });
  } catch (error) {
    console.error("Get modules error:", error);
    return Response.json(
      { error: "Unable to load modules." },
      { status: 500 }
    );
  }
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

    if (title.length < 2 || title.length > 120) {
      return Response.json(
        { error: "Title must be between 2 and 120 characters." },
        { status: 400 }
      );
    }

    if (description.length > 2000 || category.length > 80) {
      return Response.json(
        { error: "Description or category is too long." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const moduleItem: ModuleItem = {
      id: randomBytes(12).toString("hex"),
      title,
      description,
      category,
      status,
      createdAt: now,
      updatedAt: now,
    };

    await sql`
      INSERT INTO modules
        (id, title, description, category, status, created_at, updated_at)
      VALUES
        (${moduleItem.id}, ${title}, ${description}, ${category},
         ${status}, ${now}, ${now})
    `;

    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (
        ${randomBytes(8).toString("hex")},
        ${auth.current.user.email},
        ${`Created module: ${title}`},
        ${now}
      )
    `;

    return Response.json({ module: moduleItem }, { status: 201 });
  } catch (error) {
    console.error("Create module error:", error);
    return Response.json(
      { error: "Unable to create module." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const id = String(body.id || "");

    if (!id) {
      return Response.json(
        { error: "Module id is required." },
        { status: 400 }
      );
    }

    const existingRows = await sql`
      SELECT id, title, description, category, status,
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM modules
      WHERE id = ${id}
      LIMIT 1
    `;

    if (existingRows.length === 0) {
      return Response.json({ error: "Module not found." }, { status: 404 });
    }

    const existing = existingRows[0] as unknown as ModuleItem;

    const title =
      body.title !== undefined
        ? String(body.title).trim()
        : existing.title;
    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : existing.description;
    const category =
      body.category !== undefined
        ? String(body.category).trim()
        : existing.category;
    const status =
      body.status !== undefined ? body.status : existing.status;

    if (title.length < 2 || title.length > 120) {
      return Response.json(
        { error: "Title must be between 2 and 120 characters." },
        { status: 400 }
      );
    }

    if (
      description.length > 2000 ||
      category.length > 80 ||
      !["active", "draft"].includes(status)
    ) {
      return Response.json(
        { error: "Invalid description, category, or status." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const updatedRows = await sql`
      UPDATE modules
      SET title = ${title},
          description = ${description},
          category = ${category},
          status = ${status},
          updated_at = ${now}
      WHERE id = ${id}
      RETURNING id, title, description, category, status,
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;

    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (
        ${randomBytes(8).toString("hex")},
        ${auth.current.user.email},
        ${`Updated module: ${title}`},
        ${now}
      )
    `;

    return Response.json({
      module: updatedRows[0] as unknown as ModuleItem,
    });
  } catch (error) {
    console.error("Update module error:", error);
    return Response.json(
      { error: "Unable to update module." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Module id is required." },
        { status: 400 }
      );
    }

    const deletedRows = await sql`
      DELETE FROM modules
      WHERE id = ${id}
      RETURNING title
    `;

    if (deletedRows.length === 0) {
      return Response.json({ error: "Module not found." }, { status: 404 });
    }

    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (
        ${randomBytes(8).toString("hex")},
        ${auth.current.user.email},
        ${`Deleted module: ${deletedRows[0].title}`},
        ${new Date().toISOString()}
      )
    `;

    return Response.json({ message: "Module deleted." });
  } catch (error) {
    console.error("Delete module error:", error);
    return Response.json(
      { error: "Unable to delete module." },
      { status: 500 }
    );
  }
}
