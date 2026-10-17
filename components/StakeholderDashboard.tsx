"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "trainer" | "coordinator" | "admin";
type CampusUser = { id?: string; name: string; email: string; password?: string; role?: string; createdAt?: string };
type ServerModule = { id: string; title: string; description: string; category: string; status: "active" | "draft"; createdAt: string; updatedAt: string };
type Batch = { id: number; name: string; course: string; students: number; attendance: string };
type ScheduleItem = { id: number; title: string; date: string; time: string; venue: string };
type Announcement = { id: number; title: string; message: string; date: string };

const roleInfo: Record<Role, { title: string; subtitle: string; initials: string }> = {
  trainer: { title: "Trainer Workspace", subtitle: "Manage assigned batches, attendance, assessments and student feedback.", initials: "TR" },
  coordinator: { title: "Campus Coordinator Workspace", subtitle: "Coordinate batches, schedules, announcements and campus events.", initials: "CC" },
  admin: { title: "Administrator Console", subtitle: "Manage demo user roles, module availability, audit records and escalations.", initials: "AD" },
};

const initialBatches: Batch[] = [
  { id: 1, name: "Batch A · Web Development", course: "Frontend Fundamentals", students: 28, attendance: "Not marked" },
  { id: 2, name: "Batch B · Python", course: "Python Programming", students: 24, attendance: "Not marked" },
  { id: 3, name: "Batch C · Embedded", course: "Embedded Systems Essentials", students: 19, attendance: "Not marked" },
];
const initialSchedule: ScheduleItem[] = [
  { id: 1, title: "Trainer Batch Review", date: "2026-10-20", time: "10:00", venue: "Training Room 1" },
  { id: 2, title: "Student Project Clinic", date: "2026-10-22", time: "14:00", venue: "Innovation Lab" },
];
const initialAnnouncements: Announcement[] = [
  { id: 1, title: "Weekly progress update", message: "Trainers should update attendance and assessment records by Friday.", date: "Demo announcement" },
];
const key = (name: string) => `campusHubStakeholder_${name}`;

function readStored<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function store<T>(name: string, value: T) { localStorage.setItem(key(name), JSON.stringify(value)); }

export default function StakeholderDashboard({ role }: { role: Role }) {
  const router = useRouter();
  const info = roleInfo[role];
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [assessments, setAssessments] = useState<{ id: number; student: string; batch: string; score: string; feedback: string }[]>([]);
  const [feedback, setFeedback] = useState<{ id: number; student: string; text: string; date: string }[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [users, setUsers] = useState<CampusUser[]>([]);
  const [modules, setModules] = useState<Record<string, boolean>>({ Courses: true, Opportunities: true, Events: true, Community: true, Messages: true });
  const [serverModules, setServerModules] = useState<ServerModule[]>([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleCategory, setModuleCategory] = useState("Learning");
  const [moduleStatus, setModuleStatus] = useState<"active" | "draft">("active");
  const [audit, setAudit] = useState<string[]>([]);
  const [escalations, setEscalations] = useState<{ id: number; title: string; detail: string; status: string }[]>([
    { id: 1, title: "Sample access request", detail: "Review a new trainer account request.", status: "Open" },
  ]);
  const [notice, setNotice] = useState("");
  const [studentName, setStudentName] = useState("");
  const [assessmentBatch, setAssessmentBatch] = useState(initialBatches[0].name);
  const [score, setScore] = useState("80");
  const [assessmentFeedback, setAssessmentFeedback] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchCourse, setNewBatchCourse] = useState("");
  const [newBatchStudents, setNewBatchStudents] = useState("20");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("2026-10-28");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleVenue, setScheduleVenue] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [escalationTitle, setEscalationTitle] = useState("");
  const [escalationDetail, setEscalationDetail] = useState("");

  useEffect(() => {
    try {
      const current = JSON.parse(sessionStorage.getItem("campusCurrentUser") || "null") as { name?: string; email?: string; role?: string } | null;
      if (!current?.email) { router.replace("/login"); return; }
      const actualRole = current.role || "student";
      if (actualRole !== role) {
        const route = actualRole === "trainer" ? "/trainer" : actualRole === "coordinator" ? "/coordinator" : actualRole === "admin" ? "/admin" : "/";
        router.replace(route);
        return;
      }
      setEmail(current.email);
      setUserName(current.name || current.email.split("@")[0]);
      setBatches(readStored("batches", initialBatches));
      setAssessments(readStored("assessments", []));
      setFeedback(readStored("feedback", []));
      setSchedule(readStored("schedule", initialSchedule));
      setAnnouncements(readStored("announcements", initialAnnouncements));
      setUsers(readStored("users", JSON.parse(localStorage.getItem("campusHubUsers") || "[]")));
      setModules(readStored("modules", { Courses: true, Opportunities: true, Events: true, Community: true, Messages: true }));
      if (role === "admin") {
        fetch("/api/users").then(async (r) => { const d = await r.json(); if (r.ok) setUsers(d.users || []); }).catch(() => {});
      }
      fetch("/api/modules").then(async (r) => { const d = await r.json(); if (r.ok) setServerModules(d.modules || []); }).catch(() => {});
      setAudit(readStored("audit", []));
      setEscalations(readStored("escalations", [{ id: 1, title: "Sample access request", detail: "Review a new trainer account request.", status: "Open" }]));
      setReady(true);
    } catch { setNotice("Could not load saved demo data. Refresh the page and try again."); setReady(true); }
  }, [router]);

  const logAction = (message: string) => {
    const next = [`${new Date().toLocaleString()} — ${userName || role}: ${message}`, ...audit].slice(0, 50);
    setAudit(next); store("audit", next);
  };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const updateBatches = (next: Batch[]) => { setBatches(next); store("batches", next); };
  const updateAssessments = (next: typeof assessments) => { setAssessments(next); store("assessments", next); };
  const updateFeedback = (next: typeof feedback) => { setFeedback(next); store("feedback", next); };
  const updateSchedule = (next: ScheduleItem[]) => { setSchedule(next); store("schedule", next); };
  const updateAnnouncements = (next: Announcement[]) => { setAnnouncements(next); store("announcements", next); };
  const updateEscalations = (next: typeof escalations) => { setEscalations(next); store("escalations", next); };

async function logout() {
  sessionStorage.removeItem("campusCurrentUser");

  // Redirect immediately so the user isn't left waiting.
  router.replace("/login");

  // Tell the backend to invalidate the server session.
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      keepalive: true,
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
}

  async function changeUserRole(index: number, nextRole: string) {
    const selected = users[index];
    if (!selected?.id) { notify("This account is not in the backend database. Ask the user to register again."); return; }
    try {
      const response = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, role: nextRole }) });
      const result = await response.json();
      if (!response.ok) { notify(result.error || "Could not update role."); return; }
      const updated = users.map((user, i) => i === index ? { ...user, role: nextRole } : user);
      setUsers(updated);
      logAction(`Changed role for ${selected.email} to ${nextRole}`);
      notify("User role updated in the backend database.");
    } catch { notify("Backend connection failed. Role was not changed."); }
  }
  async function createServerModule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch("/api/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: moduleTitle, description: moduleDescription, category: moduleCategory, status: moduleStatus }) });
      const result = await response.json();
      if (!response.ok) { notify(result.error || "Could not create module."); return; }
      setServerModules((previous) => [result.module, ...previous]);
      logAction(`Created module: ${result.module.title}`);
      setModuleTitle(""); setModuleDescription(""); setModuleCategory("Learning"); setModuleStatus("active");
      notify("Module created and saved in the backend database.");
    } catch { notify("Backend connection failed. Module was not saved."); }
  }
  async function updateServerModule(item: ServerModule, patch: Partial<ServerModule>) {
    try {
      const response = await fetch("/api/modules", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, ...patch }) });
      const result = await response.json();
      if (!response.ok) { notify(result.error || "Could not update module."); return; }
      setServerModules((previous) => previous.map((m) => m.id === item.id ? result.module : m));
      logAction(`Updated module: ${item.title}`);
      notify("Module updated.");
    } catch { notify("Backend connection failed."); }
  }
  async function deleteServerModule(item: ServerModule) {
    if (!window.confirm(`Delete module "${item.title}"?`)) return;
    try {
      const response = await fetch(`/api/modules?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) { notify(result.error || "Could not delete module."); return; }
      setServerModules((previous) => previous.filter((m) => m.id !== item.id));
      logAction(`Deleted module: ${item.title}`);
      notify("Module deleted.");
    } catch { notify("Backend connection failed."); }
  }
  function addAssessment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!studentName.trim()) return;
    const next = [{ id: Date.now(), student: studentName.trim(), batch: assessmentBatch, score, feedback: assessmentFeedback.trim() }, ...assessments];
    updateAssessments(next); logAction(`Recorded assessment for ${studentName.trim()}`); setStudentName(""); setAssessmentFeedback(""); notify("Assessment saved.");
  }
  function addFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!feedbackText.trim()) return;
    const next = [{ id: Date.now(), student: studentName.trim() || "Student", text: feedbackText.trim(), date: new Date().toLocaleDateString() }, ...feedback];
    updateFeedback(next); logAction("Added student feedback note"); setFeedbackText(""); notify("Feedback saved.");
  }
  function addBatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const batchName = newBatchName.trim();
    const courseName = newBatchCourse.trim();
    const studentCount = Number(newBatchStudents);
    if (!batchName || !courseName || !Number.isInteger(studentCount) || studentCount < 1 || studentCount > 500) {
      notify("Enter a batch name, course and student count between 1 and 500.");
      return;
    }
    const next = [
      { id: Date.now(), name: batchName, course: courseName, students: studentCount, attendance: "Not marked" },
      ...batches,
    ];
    updateBatches(next);
    logAction(`Created batch: ${batchName}`);
    setNewBatchName("");
    setNewBatchCourse("");
    setNewBatchStudents("20");
    notify("Training batch created.");
  }

  function removeBatch(batch: Batch) {
    const next = batches.filter((item) => item.id !== batch.id);
    updateBatches(next);
    logAction(`Removed batch: ${batch.name}`);
    notify("Training batch removed.");
  }

  function addSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!scheduleTitle.trim() || !scheduleVenue.trim()) return;
    const next = [{ id: Date.now(), title: scheduleTitle.trim(), date: scheduleDate, time: scheduleTime, venue: scheduleVenue.trim() }, ...schedule];
    updateSchedule(next); logAction(`Added schedule item: ${scheduleTitle.trim()}`); setScheduleTitle(""); setScheduleVenue(""); notify("Schedule item added.");
  }
  function addAnnouncement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    const next = [{ id: Date.now(), title: announcementTitle.trim(), message: announcementMessage.trim(), date: new Date().toLocaleDateString() }, ...announcements];
    updateAnnouncements(next); logAction(`Published announcement: ${announcementTitle.trim()}`); setAnnouncementTitle(""); setAnnouncementMessage(""); notify("Announcement published in the local demo.");
  }
  function addEscalation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!escalationTitle.trim() || !escalationDetail.trim()) return;
    const next = [{ id: Date.now(), title: escalationTitle.trim(), detail: escalationDetail.trim(), status: "Open" }, ...escalations];
    updateEscalations(next); logAction(`Created escalation: ${escalationTitle.trim()}`); setEscalationTitle(""); setEscalationDetail(""); notify("Escalation recorded.");
  }
  function toggleModule(name: string) {
    const next = { ...modules, [name]: !modules[name] }; setModules(next); store("modules", next); logAction(`${name} module ${next[name] ? "enabled" : "disabled"}`);
  }

  const openEscalations = useMemo(() => escalations.filter((item) => item.status === "Open").length, [escalations]);
  const panel = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
  const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
  const button = "rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50";
  const secondary = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
  const heading = (title: string, description: string) => <div className="mb-5"><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>;

  if (!ready) return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading stakeholder workspace…</main>;

  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-2xl font-black text-slate-950">Z</div><div><p className="text-xs font-bold tracking-[0.18em] text-indigo-700">ZYNGRAM CAMPUS HUB</p><h1 className="text-xl font-bold text-slate-950 sm:text-2xl">{info.title}</h1></div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">{userName}</p><p className="text-xs text-slate-500">{email}</p></div><button onClick={logout} className={secondary}>Sign out</button></div></div>
    </header>
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white sm:p-8"><p className="text-xs font-bold tracking-[0.2em] text-cyan-300">ROLE-BASED WORKSPACE</p><h2 className="mt-3 text-3xl font-bold">Welcome, {userName}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-100">{info.subtitle}</p><p className="mt-4 text-xs text-indigo-200">Prototype note: this workspace saves data in this browser using localStorage. It is not connected to a shared server or production identity system.</p></section>

      {role === "trainer" && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Assigned batches", value: batches.length }, { label: "Learners across batches", value: batches.reduce((n, b) => n + b.students, 0) }, { label: "Assessments recorded", value: assessments.length }, { label: "Feedback notes", value: feedback.length }].map((item) => <article key={item.label} className={panel}><p className="text-sm text-slate-500">{item.label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p></article>)}</section>
        <section className={panel}>{heading("Assigned batches & attendance", "Mark each batch's attendance status for this demo. The latest status is saved locally.")}<div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-4">Batch</th><th className="py-3 pr-4">Course</th><th className="py-3 pr-4">Students</th><th className="py-3 pr-4">Attendance</th><th className="py-3">Action</th></tr></thead><tbody>{batches.map((b) => <tr key={b.id} className="border-b border-slate-100"><td className="py-4 pr-4 font-semibold text-slate-900">{b.name}</td><td className="py-4 pr-4">{b.course}</td><td className="py-4 pr-4">{b.students}</td><td className="py-4 pr-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{b.attendance}</span></td><td className="py-4"><select aria-label={`Attendance for ${b.name}`} className={field + " mt-0 max-w-40"} value={b.attendance} onChange={(e) => { updateBatches(batches.map((item) => item.id === b.id ? { ...item, attendance: e.target.value } : item)); logAction(`Updated attendance for ${b.name}: ${e.target.value}`); notify("Attendance status updated."); }}><option>Not marked</option><option>Completed</option><option>Pending review</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div></section>
        <div className="grid gap-6 lg:grid-cols-2"><section className={panel}>{heading("Task assessment", "Record a learner, batch, score and written feedback.")}<form onSubmit={addAssessment} className="space-y-3"><label className="block text-sm font-semibold">Student name<input className={field} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name" required /></label><label className="block text-sm font-semibold">Batch<select className={field} value={assessmentBatch} onChange={(e) => setAssessmentBatch(e.target.value)}>{batches.map((b) => <option key={b.id}>{b.name}</option>)}</select></label><label className="block text-sm font-semibold">Score (%)<input className={field} type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} required /></label><label className="block text-sm font-semibold">Assessment feedback<textarea className={field} rows={3} value={assessmentFeedback} onChange={(e) => setAssessmentFeedback(e.target.value)} placeholder="Strengths and next steps" /></label><button className={button}>Save assessment</button></form></section><section className={panel}>{heading("Student feedback", "Keep a short note from a student or a follow-up conversation.")}<form onSubmit={addFeedback} className="space-y-3"><label className="block text-sm font-semibold">Student name (optional)<input className={field} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student name" /></label><label className="block text-sm font-semibold">Feedback note<textarea className={field} rows={4} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Enter feedback or follow-up" required /></label><button className={button}>Save feedback</button></form></section></div>
        <section className={panel}>{heading("Recent assessments", "Saved assessment records in this browser.")}{assessments.length === 0 ? <p className="text-sm text-slate-500">No assessments recorded yet.</p> : <div className="space-y-3">{assessments.map((a) => <article key={a.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{a.student}</strong><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{a.score}%</span></div><p className="mt-1 text-sm text-slate-500">{a.batch}</p>{a.feedback && <p className="mt-2 text-sm">{a.feedback}</p>}</article>)}</div>}</section>
      </>}

      {role === "coordinator" && <>
        <section className="grid gap-4 sm:grid-cols-3">{[{ label: "Scheduled activities", value: schedule.length }, { label: "Announcements", value: announcements.length }, { label: "Batches to coordinate", value: batches.length }].map((item) => <article key={item.label} className={panel}><p className="text-sm text-slate-500">{item.label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p></article>)}</section>
        <section className={panel}>
          {heading("Training batch management", "Create and maintain batches. Trainers will see the same demo batch list when they sign in in this browser.")}
          <form onSubmit={addBatch} className="grid gap-3 md:grid-cols-4 md:items-end">
            <label className="block text-sm font-semibold">Batch name<input className={field} value={newBatchName} onChange={(e) => setNewBatchName(e.target.value)} placeholder="e.g. Batch D · AI Agents" required /></label>
            <label className="block text-sm font-semibold">Course / track<input className={field} value={newBatchCourse} onChange={(e) => setNewBatchCourse(e.target.value)} placeholder="e.g. AI Agent Fundamentals" required /></label>
            <label className="block text-sm font-semibold">Student count<input className={field} type="number" min="1" max="500" step="1" value={newBatchStudents} onChange={(e) => setNewBatchStudents(e.target.value)} required /></label>
            <button className={button}>Create batch</button>
          </form>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-4">Batch</th><th className="py-3 pr-4">Course</th><th className="py-3 pr-4">Students</th><th className="py-3 pr-4">Attendance</th><th className="py-3">Action</th></tr></thead>
              <tbody>{batches.map((batch) => <tr key={batch.id} className="border-b border-slate-100"><td className="py-4 pr-4 font-semibold">{batch.name}</td><td className="py-4 pr-4">{batch.course}</td><td className="py-4 pr-4">{batch.students}</td><td className="py-4 pr-4">{batch.attendance}</td><td className="py-4"><button type="button" className={secondary} onClick={() => removeBatch(batch)}>Remove</button></td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-2"><section className={panel}>{heading("Schedule coordination", "Add a training session, meeting or campus activity.")}<form onSubmit={addSchedule} className="space-y-3"><label className="block text-sm font-semibold">Activity title<input className={field} value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} placeholder="e.g. Batch review meeting" required /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Date<input className={field} type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required /></label><label className="block text-sm font-semibold">Time<input className={field} type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} required /></label></div><label className="block text-sm font-semibold">Venue / meeting link<input className={field} value={scheduleVenue} onChange={(e) => setScheduleVenue(e.target.value)} placeholder="Room, hall or meeting link" required /></label><button className={button}>Add to schedule</button></form></section><section className={panel}>{heading("Campus announcements", "Publish updates for the demo workspace.")}<form onSubmit={addAnnouncement} className="space-y-3"><label className="block text-sm font-semibold">Announcement title<input className={field} value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Enter a clear title" required /></label><label className="block text-sm font-semibold">Message<textarea className={field} rows={4} value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} placeholder="Write the announcement" required /></label><button className={button}>Publish announcement</button></form></section></div>
        <section className={panel}>{heading("Upcoming schedule", "Review and remove items when they are no longer needed.")}{schedule.length === 0 ? <p className="text-sm text-slate-500">No activities scheduled.</p> : <div className="space-y-3">{schedule.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"><div><h3 className="font-bold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.date} · {item.time} · {item.venue}</p></div><button className={secondary} onClick={() => { updateSchedule(schedule.filter((s) => s.id !== item.id)); logAction(`Removed schedule item: ${item.title}`); }}>Remove</button></article>)}</div>}</section>
        <section className={panel}>{heading("Published announcements", "Latest coordinator updates.")}{announcements.map((item) => <article key={item.id} className="border-b border-slate-100 py-4 last:border-0"><p className="text-xs text-slate-500">{item.date}</p><h3 className="mt-1 font-bold text-slate-900">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p></article>)}</section>
      </>}

      {role === "admin" && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Registered demo users", value: users.length }, { label: "Modules enabled", value: Object.values(modules).filter(Boolean).length }, { label: "Open escalations", value: openEscalations }, { label: "Audit entries", value: audit.length }].map((item) => <article key={item.label} className={panel}><p className="text-sm text-slate-500">{item.label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p></article>)}</section>
        <section className={panel}>{heading("User access management", "Change demo account roles. Staff access must be granted only to authorised people in a real system.")}{users.length === 0 ? <p className="text-sm text-slate-500">No registered users found. Create accounts from the registration page first.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Email</th><th className="py-3 pr-4">Role</th><th className="py-3">Update role</th></tr></thead><tbody>{users.map((user, index) => <tr key={`${user.email}-${index}`} className="border-b border-slate-100"><td className="py-4 pr-4 font-semibold">{user.name}</td><td className="py-4 pr-4">{user.email}</td><td className="py-4 pr-4">{user.role || "student"}</td><td className="py-4"><select aria-label={`Role for ${user.email}`} className={field + " mt-0 max-w-48"} value={user.role || "student"} onChange={(e) => changeUserRole(index, e.target.value)}><option value="student">Student</option><option value="trainer">Trainer</option><option value="coordinator">Campus Coordinator</option><option value="admin">Administrator</option></select></td></tr>)}</tbody></table></div>}</section>
        <section className={panel}>
           {heading("Module management (database CRUD)", "Create, view, activate or draft, and delete modules. Changes are stored on the server.")}
           <form onSubmit={createServerModule} className="mb-6 grid gap-3 md:grid-cols-2">
             <label className="block text-sm font-semibold">Module title<input className={field} value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="e.g. Embedded Systems" required minLength={2} maxLength={120} /></label>
             <label className="block text-sm font-semibold">Category<input className={field} value={moduleCategory} onChange={(e) => setModuleCategory(e.target.value)} placeholder="Learning" required /></label>
             <label className="block text-sm font-semibold md:col-span-2">Description<textarea className={field} rows={2} value={moduleDescription} onChange={(e) => setModuleDescription(e.target.value)} placeholder="Describe this module" /></label>
             <label className="block text-sm font-semibold">Initial status<select className={field} value={moduleStatus} onChange={(e) => setModuleStatus(e.target.value as "active" | "draft")}><option value="active">Active</option><option value="draft">Draft</option></select></label>
             <div className="flex items-end"><button className={button} type="submit">Create module</button></div>
           </form>
           {serverModules.length === 0 ? <p className="text-sm text-slate-500">No database modules yet. Create the first module above.</p> : <div className="space-y-3">{serverModules.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.category}</p><h3 className="mt-1 font-bold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.description || "No description provided."}</p><p className="mt-2 text-xs text-slate-500">Status: {item.status} · Updated: {new Date(item.updatedAt).toLocaleString()}</p></div><div className="flex gap-2"><button type="button" className={secondary} onClick={() => updateServerModule(item, { status: item.status === "active" ? "draft" : "active" })}>{item.status === "active" ? "Move to draft" : "Activate"}</button><button type="button" className={secondary} onClick={() => deleteServerModule(item)}>Delete</button></div></div></article>)}</div>}
         </section>
         <section className={panel}>{heading("Module configuration", "Enable or disable demo modules. These switches are local prototype settings, not live access controls.")}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(modules).map(([name, enabled]) => <label key={name} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><strong className="block text-sm text-slate-900">{name}</strong><small className="text-slate-500">{enabled ? "Enabled" : "Disabled"}</small></span><input type="checkbox" checked={enabled} onChange={() => toggleModule(name)} className="h-5 w-5 accent-indigo-600" /></label>)}</div></section>
        <div className="grid gap-6 lg:grid-cols-2"><section className={panel}>{heading("Escalations", "Record an issue for administrative review and update its status.")}<form onSubmit={addEscalation} className="space-y-3"><label className="block text-sm font-semibold">Issue title<input className={field} value={escalationTitle} onChange={(e) => setEscalationTitle(e.target.value)} placeholder="e.g. Account access issue" required /></label><label className="block text-sm font-semibold">Details<textarea className={field} rows={3} value={escalationDetail} onChange={(e) => setEscalationDetail(e.target.value)} placeholder="Describe the issue and requested action" required /></label><button className={button}>Create escalation</button></form><div className="mt-5 space-y-3">{escalations.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><strong>{item.title}</strong><select aria-label={`Status for ${item.title}`} className={field + " mt-0 max-w-40"} value={item.status} onChange={(e) => { const next = escalations.map((x) => x.id === item.id ? { ...x, status: e.target.value } : x); updateEscalations(next); logAction(`Escalation ${item.title} marked ${e.target.value}`); }}><option>Open</option><option>In progress</option><option>Resolved</option></select></div><p className="mt-2 text-sm text-slate-600">{item.detail}</p></article>)}</div></section><section className={panel}>{heading("Audit log", "Recent actions recorded by this browser prototype.")}{audit.length === 0 ? <p className="text-sm text-slate-500">Actions will appear here when you change a role, module, schedule or escalation.</p> : <div className="max-h-[480px] space-y-2 overflow-y-auto">{audit.map((entry, i) => <p key={`${entry}-${i}`} className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">{entry}</p>)}</div>}<button className={secondary + " mt-4"} onClick={() => { setAudit([]); store("audit", []); notify("Audit log cleared."); }}>Clear demo audit log</button></section></div>
      </>}
      <footer className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">Backend status: login, password hashing, server sessions, user-role changes and module CRUD use the server-side persistent data file. Training schedules, assessments, feedback and some prototype settings still use this browser's local storage. This is a local demonstration; add verified password recovery, HTTPS and a managed database before production use.</footer>
    </main>
  </div>;
}
