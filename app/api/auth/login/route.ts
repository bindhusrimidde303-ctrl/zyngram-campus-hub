
import {
  addAudit,
  ensureSeedAdmin,
  publicUser,
  readStore,
  verifyPassword,
  writeStore,
  createSession,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await ensureSeedAdmin();

    const store = await readStore();
    const user = store.users.find((u) => u.email === email);

    if (
      !user ||
      !verifyPassword(password, user.salt, user.passwordHash)
    ) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    addAudit(store, user.email, "Signed in");
    await writeStore(store);

    const token = await createSession(user.id);

    const response = Response.json({
      user: publicUser(user),
    });

    response.headers.append(
      "Set-Cookie",
      `campus_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      { error: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
