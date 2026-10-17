import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type Role = "student" | "trainer" | "coordinator" | "admin";
export type PublicUser = { id: string; name: string; email: string; role: Role; createdAt: string };
type StoredUser = PublicUser & { passwordHash: string; salt: string };
type Session = { token: string; userId: string; expiresAt: number };
export type ModuleItem = { id: string; title: string; description: string; category: string; status: "active" | "draft"; createdAt: string; updatedAt: string };
type Store = { users: StoredUser[]; sessions: Session[]; modules: ModuleItem[]; audit: { id: string; actor: string; action: string; createdAt: string }[] };

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "campus-hub-db.json");
const emptyStore = (): Store => ({ users: [], sessions: [], modules: [], audit: [] });

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(emptyStore(), null, 2), "utf8");
}
export function readStore(): Store {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8")) as Partial<Store>;
    return { ...emptyStore(), ...parsed };
  } catch {
    throw new Error("Database file is unreadable. Back up data/campus-hub-db.json and restore valid JSON.");
  }
}
export function writeStore(store: Store) {
  ensureStore();
  const temp = `${dataFile}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(temp, dataFile);
}
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, passwordHash: scryptSync(password, salt, 64).toString("hex") };
}
export function verifyPassword(password: string, salt: string, expected: string) {
  const actual = scryptSync(password, salt, 64);
  const stored = Buffer.from(expected, "hex");
  return stored.length === actual.length && timingSafeEqual(stored, actual);
}
export function publicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
export function ensureSeedAdmin(store: Store) {
  const email = (process.env.ADMIN_EMAIL || "admin@campushub.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const found = store.users.find((u) => u.email === email);
  if (!found) {
    const hashed = hashPassword(password);
    store.users.push({
      id: randomBytes(12).toString("hex"), name: "Campus Administrator", email, role: "admin",
      createdAt: new Date().toISOString(), ...hashed,
    });
    writeStore(store);
  }
}
export function addAudit(store: Store, actor: string, action: string) {
  store.audit.unshift({ id: randomBytes(8).toString("hex"), actor, action, createdAt: new Date().toISOString() });
  store.audit = store.audit.slice(0, 200);
}
export function getUserBySessionToken(token: string | undefined) {
  if (!token) return null;
  const store = readStore();
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  const user = store.users.find((u) => u.id === session.userId);
  return user ? { store, user } : null;
}
export function createSession(userId: string) {
  const store = readStore();
  const token = randomBytes(32).toString("hex");
  store.sessions = store.sessions.filter((s) => s.expiresAt > Date.now() && s.userId !== userId);
  store.sessions.push({ token, userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  writeStore(store);
  return token;
}
