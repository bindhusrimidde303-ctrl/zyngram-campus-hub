
import { hashPassword } from "@/lib/db";
import { sql } from "@/lib/neon";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    const userRows = await sql`
      SELECT id FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (userRows.length === 0) {
      return Response.json(
        { error: "No account found for this email." },
        { status: 404 }
      );
    }

    const hashed = hashPassword(password);

    await sql`
      UPDATE users
      SET password_hash = ${hashed.passwordHash},
          salt = ${hashed.salt}
      WHERE email = ${email}
    `;

    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (
        ${randomBytes(8).toString("hex")},
        ${email},
        ${"Reset password using demo recovery form"},
        ${new Date().toISOString()}
      )
    `;

    return Response.json({
      message: "Password updated. Please sign in again."
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return Response.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
