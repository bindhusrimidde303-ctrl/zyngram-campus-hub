
import { randomBytes } from "node:crypto";
import { publicUser, type Role, type StoredUser } from "@/lib/db";
import { sql } from "@/lib/neon";
import { requireRole } from "@/lib/server-auth";

const allowedRoles: Role[] = [
  "student",
  "trainer",
  "coordinator",
  "admin",
];

export async function GET() {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const rows = await sql`
      SELECT id, name, email, role,
             password_hash AS "passwordHash",
             salt,
             created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
    `;

    const users = rows.map((row) =>
      publicUser(row as unknown as StoredUser)
    );

    return Response.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return Response.json(
      { error: "Unable to load users." },
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
    const role = String(body.role || "") as Role;

    if (!id || !allowedRoles.includes(role)) {
      return Response.json(
        { error: "A valid user id and role are required." },
        { status: 400 }
      );
    }

    if (id === auth.current.user.id && role !== "admin") {
      return Response.json(
        { error: "You cannot remove your own administrator access." },
        { status: 400 }
      );
    }

    const updatedRows = await sql`
      UPDATE users
      SET role = ${role}
      WHERE id = ${id}
      RETURNING id, name, email, role,
                password_hash AS "passwordHash",
                salt,
                created_at AS "createdAt"
    `;

    if (updatedRows.length === 0) {
      return Response.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const updatedUser = updatedRows[0] as unknown as StoredUser;

    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (
        ${randomBytes(8).toString("hex")},
        ${auth.current.user.email},
        ${`Changed ${updatedUser.email} role to ${role}`},
        ${new Date().toISOString()}
      )
    `;

    return Response.json({ user: publicUser(updatedUser) });
  } catch (error) {
    console.error("Update user role error:", error);
    return Response.json(
      { error: "Unable to update user role." },
      { status: 500 }
    );
  }
}
