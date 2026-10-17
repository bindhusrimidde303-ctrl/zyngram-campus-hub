
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sql } from "@/lib/neon";

export type Role = "student" | "trainer" | "coordinator" | "admin";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type StoredUser = PublicUser & {
  passwordHash: string;
  salt: string;
};

export type Session = {
  token: string;
  userId: string;
  expiresAt: number;
};

export type ModuleItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "draft";
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  users: StoredUser[];
  sessions: Session[];
  modules: ModuleItem[];
  audit: {
    id: string;
    actor: string;
    action: string;
    createdAt: string;
  }[];
};

export function hashPassword(
  password: string,
  salt = randomBytes(16).toString("hex")
) {
  return {
    salt,
    passwordHash: scryptSync(password, salt, 64).toString("hex"),
  };
}

export function verifyPassword(
  password: string,
  salt: string,
  expected: string
) {
  const actual = scryptSync(password, salt, 64);
  const stored = Buffer.from(expected, "hex");

  return (
    stored.length === actual.length &&
    timingSafeEqual(stored, actual)
  );
}

export function publicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function readStore(): Promise<Store> {
  const [users, sessions, modules, audit] = await Promise.all([
    sql`SELECT id, name, email, role, password_hash AS "passwordHash",
        salt, created_at AS "createdAt" FROM users`,
    sql`SELECT token, user_id AS "userId", expires_at AS "expiresAt"
        FROM sessions`,
    sql`SELECT id, title, description, category, status,
        created_at AS "createdAt", updated_at AS "updatedAt" FROM modules`,
    sql`SELECT id, actor, action, created_at AS "createdAt"
        FROM audit_logs ORDER BY created_at DESC LIMIT 200`,
  ]);

  return {
    users: users as unknown as StoredUser[],
    sessions: sessions.map((s) => ({
      ...s,
      expiresAt: Number(s.expiresAt),
    })) as Session[],
    modules: modules as unknown as ModuleItem[],
    audit: audit as unknown as Store["audit"],
  };
}

export async function writeStore(store: Store): Promise<void> {
  for (const user of store.users) {
    await sql`
      INSERT INTO users (id, name, email, role, password_hash, salt, created_at)
      VALUES (
        ${user.id}, ${user.name}, ${user.email}, ${user.role},
        ${user.passwordHash}, ${user.salt}, ${user.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash,
        salt = EXCLUDED.salt
    `;
  }

  for (const session of store.sessions) {
    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${session.token}, ${session.userId}, ${session.expiresAt})
      ON CONFLICT (token) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        expires_at = EXCLUDED.expires_at
    `;
  }

  for (const item of store.modules) {
    await sql`
      INSERT INTO modules
        (id, title, description, category, status, created_at, updated_at)
      VALUES (
        ${item.id}, ${item.title}, ${item.description}, ${item.category},
        ${item.status}, ${item.createdAt}, ${item.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
    `;
  }

  for (const entry of store.audit) {
    await sql`
      INSERT INTO audit_logs (id, actor, action, created_at)
      VALUES (${entry.id}, ${entry.actor}, ${entry.action}, ${entry.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function ensureSeedAdmin(store?: Store): Promise<void> {
  const email = (
    process.env.ADMIN_EMAIL || "admin@campushub.local"
  ).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existing = await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;

  if (existing.length > 0) return;

  const hashed = hashPassword(password);

  await sql`
    INSERT INTO users
      (id, name, email, role, password_hash, salt, created_at)
    VALUES (
      ${randomBytes(12).toString("hex")},
      'Campus Administrator',
      ${email},
      'admin',
      ${hashed.passwordHash},
      ${hashed.salt},
      ${new Date().toISOString()}
    )
    ON CONFLICT (email) DO NOTHING
  `;
}

export function addAudit(
  store: Store,
  actor: string,
  action: string
): void {
  store.audit.unshift({
    id: randomBytes(8).toString("hex"),
    actor,
    action,
    createdAt: new Date().toISOString(),
  });

  store.audit = store.audit.slice(0, 200);
}

export async function getUserBySessionToken(
  token: string | undefined
): Promise<{ store: Store; user: StoredUser } | null> {
  if (!token) return null;

  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role,
           u.password_hash AS "passwordHash", u.salt,
           u.created_at AS "createdAt"
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.expires_at > ${Date.now()}
    LIMIT 1
  `;

  if (!rows.length) return null;

  return {
    store: await readStore(),
    user: rows[0] as unknown as StoredUser,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await sql`
    DELETE FROM sessions
    WHERE expires_at <= ${Date.now()} OR user_id = ${userId}
  `;

  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt})
  `;

  return token;
}
