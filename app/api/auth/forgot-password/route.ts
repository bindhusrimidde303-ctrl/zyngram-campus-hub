import { addAudit, readStore, hashPassword, writeStore } from "@/lib/db";
// Demonstration-only reset. Production reset should use a verified, expiring email token.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (password.length < 8) return Response.json({ error: "Password must contain at least 8 characters." }, { status: 400 });
    const store = readStore();
    const user = store.users.find((u) => u.email === email);
    if (!user) return Response.json({ error: "No account found for this email." }, { status: 404 });
    const hashed = hashPassword(password);
    user.salt = hashed.salt; user.passwordHash = hashed.passwordHash;
    addAudit(store, email, "Reset password using demo recovery form"); writeStore(store);
    return Response.json({ message: "Password updated. Please sign in again." });
  } catch { return Response.json({ error: "Unable to reset password." }, { status: 500 }); }
}
