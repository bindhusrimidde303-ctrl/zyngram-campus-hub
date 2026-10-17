
import { randomBytes } from "node:crypto";
import {
  addAudit,
  hashPassword,
  publicUser,
  readStore,
  writeStore,
  ensureSeedAdmin,
  type Role,
} from "@/lib/db";

const allowedRoles: Role[] = ["student", "trainer", "coordinator"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const requestedRole = String(body.role || "student").toLowerCase();

    if (name.length < 2 || name.length > 100) {
      return Response.json(
        { error: "Enter a name between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(requestedRole as Role)) {
      return Response.json(
        {
          error:
            "Invalid registration role. Admin accounts must be created through authorized setup.",
        },
        { status: 403 }
      );
    }

    const role = requestedRole as Role;

    await ensureSeedAdmin();

    const store = await readStore();

    if (store.users.some((user) => user.email === email)) {
      return Response.json(
        { error: "This email is already registered. Please sign in." },
        { status: 409 }
      );
    }

    const hashed = hashPassword(password);

    const user = {
      id: randomBytes(12).toString("hex"),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      ...hashed,
    };

    store.users.push(user);
    addAudit(store, email, `Registered ${role} account`);

    await writeStore(store);

    return Response.json(
      {
        message: "Account created successfully.",
        user: publicUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
