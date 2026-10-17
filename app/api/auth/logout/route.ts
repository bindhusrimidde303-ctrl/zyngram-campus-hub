
import { cookies } from "next/headers";
import { sql } from "@/lib/neon";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("campus_session")?.value;

    if (token) {
      await sql`
        DELETE FROM sessions
        WHERE token = ${token}
      `;
    }

    const response = Response.json({ message: "Signed out." });

    response.headers.append(
      "Set-Cookie",
      `campus_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      { error: "Unable to sign out. Please try again." },
      { status: 500 }
    );
  }
}
