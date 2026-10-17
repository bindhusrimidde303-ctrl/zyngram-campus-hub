
import { cookies } from "next/headers";
import {
  getUserBySessionToken,
  publicUser,
  type Role,
} from "./db";

export async function currentUser() {
  const cookieStore = await cookies();

  const session = await getUserBySessionToken(
    cookieStore.get("campus_session")?.value
  );

  return session
    ? {
        ...session,
        publicUser: publicUser(session.user),
      }
    : null;
}

export async function requireRole(roles: Role[]) {
  const current = await currentUser();

  if (!current) {
    return {
      error: Response.json(
        { error: "Please sign in." },
        { status: 401 }
      ),
    } as const;
  }

  if (!roles.includes(current.user.role)) {
    return {
      error: Response.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 }
      ),
    } as const;
  }

  return { current } as const;
}
