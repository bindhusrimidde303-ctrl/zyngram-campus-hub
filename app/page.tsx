
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Section =
  | "Dashboard"
  | "My Profile"
  | "Courses"
  | "Opportunities"
  | "Internships & Jobs"
  | "Campus Events"
  | "Announcements"
  | "Community"
  | "Messages";

type StudentProfile = {
  name: string;
  college: string;
  degree: string;
  year: string;
  skills: string;
  bio: string;
};

type Listing = {
  id: number;
  title: string;
  category: string;
  description: string;
  duration?: string;
  type?: string;
};

const navigation: { name: Section; icon: string }[] = [
  { name: "Dashboard", icon: "⌂" },
  { name: "My Profile", icon: "♙" },
  { name: "Courses", icon: "▣" },
  { name: "Opportunities", icon: "↗" },
  { name: "Internships & Jobs", icon: "♧" },
  { name: "Campus Events", icon: "◎" },
  { name: "Announcements", icon: "▤" },
  { name: "Community", icon: "♧" },
  { name: "Messages", icon: "✉" },
];

const courses: Listing[] = [
  { id: 1, title: "Python Programming", category: "Programming", duration: "8 weeks", description: "Learn Python fundamentals, functions, collections, and practical programming." },
  { id: 2, title: "Web Development Fundamentals", category: "Development", duration: "6 weeks", description: "Explore HTML, CSS, JavaScript, and responsive website development." },
  { id: 3, title: "Artificial Intelligence Basics", category: "AI & Technology", duration: "5 weeks", description: "Understand AI concepts, machine learning, and real-world applications." },
  { id: 4, title: "Embedded Systems Essentials", category: "Electronics", duration: "8 weeks", description: "Explore microcontrollers, sensors, embedded C, and hardware interfaces." },
];

const opportunities: Listing[] = [
  { id: 11, title: "Student Project Showcase", category: "Projects", type: "Student opportunity", description: "Present your academic project and connect with other student innovators." },
  { id: 12, title: "Campus Innovation Challenge", category: "Innovation", type: "Competition", description: "Collaborate with a team to develop a solution to a practical problem." },
  { id: 13, title: "Career Mentoring Session", category: "Career", type: "Mentorship", description: "Learn about career paths, interview preparation, and professional skills." },
  { id: 14, title: "Technical Workshop", category: "Learning", type: "Workshop", description: "Build practical technical knowledge through guided activities." },
];

const jobs: Listing[] = [
  { id: 21, title: "Frontend Development Intern", category: "Technology", type: "Internship", duration: "3 months", description: "Assist with responsive web interfaces and frontend development tasks." },
  { id: 22, title: "Python Intern", category: "Programming", type: "Internship", duration: "2 months", description: "Practice Python programming and support small development projects." },
  { id: 23, title: "Embedded Systems Trainee", category: "Electronics", type: "Trainee role", duration: "6 months", description: "Gain exposure to microcontrollers, embedded C, and hardware testing." },
];

const events = [
  { id: 31, day: "18", month: "OCT", title: "Career Guidance Workshop", time: "10:00 AM", location: "Seminar Hall", description: "Explore career paths and prepare for interviews." },
  { id: 32, day: "21", month: "OCT", title: "Student Tech Meetup", time: "2:00 PM", location: "Innovation Lab", description: "Meet students interested in technology and projects." },
  { id: 33, day: "25", month: "OCT", title: "Project Presentation Day", time: "11:00 AM", location: "Main Auditorium", description: "Showcase ideas and learn from other student projects." },
];

const announcements = [
  { id: 41, title: "Campus Hub student registration is open", date: "Campus Hub", text: "Students can create a profile and explore the available learning sections." },
  { id: 42, title: "New internship and project opportunities", date: "Campus Hub", text: "Explore the opportunities section and review the sample listings." },
  { id: 43, title: "Complete your student profile", date: "Campus Hub", text: "Add your education and skills to keep your academic information organised." },
];

const initialProfile: StudentProfile = {
  name: "",
  college: "",
  degree: "",
  year: "",
  skills: "",
  bio: "",
};

const storageKeys = {
  // These two keys must match the login and registration pages.
  user: "campusCurrentUser",
  users: "campusHubUsers",
  profile: "campusHubProfile",
  saved: "campusHubSavedCourses",
  applications: "campusHubApplications",
  joined: "campusHubJoinedEvents",
  posts: "campusHubCommunityPosts",
  messages: "campusHubMessages",
};

function getProfileKey(email: string) {
  return `${storageKeys.profile}_${email.trim().toLowerCase()}`;
}

function readArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveValue(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function Home() {
  const router = useRouter();

  const [active, setActive] = useState<Section>("Dashboard");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [savedCourses, setSavedCourses] = useState<number[]>([]);
  const [applications, setApplications] = useState<number[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<number[]>([]);
  const [posts, setPosts] = useState<{ id: number; text: string; author: string; date: string }[]>([]);
  const [messages, setMessages] = useState<{ id: number; text: string; from: string }[]>([]);
  const [postText, setPostText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // LoginPage stores the signed-in user object in sessionStorage.
    let currentEmail = "";
    let currentName = "";
    try {
      const rawUser = sessionStorage.getItem(storageKeys.user);
      if (rawUser) {
        const currentUser = JSON.parse(rawUser) as { name?: string; email?: string; role?: string };
        currentEmail = currentUser.email || "";
        currentName = currentUser.name || "";
      }
    } catch {
      currentEmail = "";
    }
        setEmail(currentEmail);

    if (!currentEmail) {
      window.location.replace("/login");
      return;
    }
function getProfileKey(userEmail: string) {
  return `${storageKeys.profile}_${userEmail.trim().toLowerCase()}`;
}

const profileKey = getProfileKey(currentEmail);
    // Migrate the earlier shared profile once, so existing demo data is not lost.
    const storedProfile = localStorage.getItem(profileKey) || localStorage.getItem(storageKeys.profile);
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as Partial<StudentProfile>;
        setProfile({ ...initialProfile, ...parsed, name: parsed.name || currentName });
      } catch {
        setProfile({ ...initialProfile, name: currentName });
      }
    } else {
      const users = readArray<{ name?: string; email: string }>(storageKeys.users, []);
      const current = users.find((user) => user.email?.toLowerCase() === currentEmail.toLowerCase());
      setProfile({ ...initialProfile, name: current?.name || currentName });
    }

    setSavedCourses(readArray(storageKeys.saved, []));
    setApplications(readArray(storageKeys.applications, []));
    setJoinedEvents(readArray(storageKeys.joined, []));
    setPosts(readArray(storageKeys.posts, [
      { id: 1, author: "Campus Hub", text: "Welcome to the student community! Share your learning goals and project ideas.", date: "Welcome post" },
    ]));
    setMessages(readArray(storageKeys.messages, []));
    setReady(true);
  }, []);

  const displayName = profile.name.trim() || (email ? email.split("@")[0] : "Student");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "ST";

  const filteredCourses = useMemo(
    () => courses.filter((item) => `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const filteredOpportunities = useMemo(
    () => opportunities.filter((item) => `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const filteredJobs = useMemo(
    () => jobs.filter((item) => `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  function notify(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const cleanedProfile: StudentProfile = {
        name: profile.name.trim(),
        college: profile.college.trim(),
        degree: profile.degree.trim(),
        year: profile.year.trim(),
        skills: profile.skills.trim(),
        bio: profile.bio.trim(),
      };
      if (!cleanedProfile.name) {
        notify("Please enter your full name before saving.");
        return;
      }
      localStorage.setItem(getProfileKey(email), JSON.stringify(cleanedProfile));
      // Keep the current in-memory form in sync with what was saved.
      setProfile(cleanedProfile);
      notify("Your profile has been saved successfully.");
    } catch {
      notify("Could not save the profile. Please check browser storage and try again.");
    }
  }

  function toggleCourse(id: number) {
    const next = savedCourses.includes(id)
      ? savedCourses.filter((courseId) => courseId !== id)
      : [...savedCourses, id];
    setSavedCourses(next);
    saveValue(storageKeys.saved, next);
    notify(next.includes(id) ? "Course saved to your list." : "Course removed from your saved list.");
  }

  function applyFor(id: number) {
    if (applications.includes(id)) {
      notify("You have already applied to this listing.");
      return;
    }
    const next = [...applications, id];
    setApplications(next);
    saveValue(storageKeys.applications, next);
    notify("Application recorded in this demo.");
  }

  function joinEvent(id: number) {
    if (joinedEvents.includes(id)) {
      notify("You have already joined this event.");
      return;
    }
    const next = [...joinedEvents, id];
    setJoinedEvents(next);
    saveValue(storageKeys.joined, next);
    notify("You have joined the event.");
  }

  function publishPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postText.trim()) return;
    const next = [{ id: Date.now(), author: displayName, text: postText.trim(), date: new Date().toLocaleDateString() }, ...posts];
    setPosts(next);
    saveValue(storageKeys.posts, next);
    setPostText("");
    notify("Your community post has been published.");
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!messageText.trim()) return;
    const next = [...messages, { id: Date.now(), from: displayName, text: messageText.trim() }];
    setMessages(next);
    saveValue(storageKeys.messages, next);
    setMessageText("");
    notify("Message added to the demo conversation.");
  }

  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    sessionStorage.removeItem(storageKeys.user);
    router.push("/login");
  }

  function goTo(section: Section) {
    setActive(section);
    setSearch("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading Campus Hub...</div>;
  }

  const panelClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
  const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
  const primaryButton = "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300";
  const secondaryButton = "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

  function listingCard(item: Listing, kind: "course" | "opportunity" | "job") {
    const isSaved = savedCourses.includes(item.id);
    const isApplied = applications.includes(item.id);
    return (
      <article key={item.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{item.category}</span>
          <span className="text-lg text-indigo-500">{kind === "course" ? "▣" : kind === "job" ? "♧" : "↗"}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">{item.duration || item.type || "Campus listing"}</span>
          {kind === "course" ? (
            <button onClick={() => toggleCourse(item.id)} className={isSaved ? secondaryButton : primaryButton}>
              {isSaved ? "✓ Saved" : "Save course"}
            </button>
          ) : (
            <button onClick={() => applyFor(item.id)} disabled={isApplied} className={isApplied ? secondaryButton : primaryButton}>
              {isApplied ? "✓ Applied" : "Apply now"}
            </button>
          )}
        </div>
      </article>
    );
  }

  function sectionHeading(title: string, description: string) {
    return (
      <div className="mb-6">
        <p className="text-sm text-slate-500">Student Workspace / {title}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    );
  }

  function searchBox(placeholder: string) {
    return (
      <div className="mb-5">
        <label className="sr-only" htmlFor="section-search">Search listings</label>
        <input id="section-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} className={fieldClass + " mt-0 max-w-xl"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-950 text-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-3xl font-black text-slate-950">Z</div>
          <div>
            <div className="text-xl font-bold tracking-tight">Zyngram</div>
            <div className="text-xs tracking-widest text-slate-300">CAMPUS HUB</div>
          </div>
        </div>

        <p className="px-7 pb-3 pt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => (
            <button key={item.name} onClick={() => goTo(item.name)} className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${active === item.name ? "bg-cyan-400 font-bold text-slate-950 shadow-sm" : "text-slate-200 hover:bg-slate-800"}`}>
              <span className="w-5 text-center text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="m-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <p className="font-semibold">Your next step</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">Complete your profile to explore relevant learning and career opportunities.</p>
          <button onClick={() => goTo("My Profile")} className="mt-3 text-sm font-bold text-cyan-300 hover:text-cyan-200">Complete profile →</button>
        </div>
        <button onClick={logout} className="mx-4 mb-5 rounded-xl border border-slate-700 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800">↪ Sign out</button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 sm:text-sm">Student Workspace / <span className="font-semibold text-slate-800">{active}</span></p>
            <p className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">{active === "Dashboard" ? "Campus Dashboard" : active}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">Academic Year 2026–27</span>
            <div title={displayName} className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{initials}</div>
            <button onClick={logout} className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:block">Sign out</button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-7 lg:p-9">
          {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div>}

          {active === "Dashboard" && (
            <>
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white sm:p-10">
                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">YOUR CAMPUS. YOUR FUTURE.</span>
                  <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Learn more. Connect more. Grow together.</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">Welcome, {displayName}. Explore courses, discover opportunities, join campus activities, and prepare for your career in one place.</p>
                  <button onClick={() => goTo("Opportunities")} className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300">Explore opportunities →</button>
                </div>
                <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5 sm:h-80 sm:w-80" />
                <div className="pointer-events-none absolute -bottom-24 right-28 h-52 w-52 rounded-full bg-cyan-400/10 blur-2xl" />
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { title: "Available courses", value: String(courses.length).padStart(2, "0"), sub: `${savedCourses.length} saved by you`, icon: "▣", color: "bg-indigo-50 text-indigo-700", target: "Courses" as Section },
                  { title: "Opportunities", value: String(opportunities.length).padStart(2, "0"), sub: "Explore campus listings", icon: "↗", color: "bg-cyan-50 text-cyan-700", target: "Opportunities" as Section },
                  { title: "Applications", value: String(applications.length).padStart(2, "0"), sub: "Your recorded applications", icon: "✓", color: "bg-emerald-50 text-emerald-700", target: "Internships & Jobs" as Section },
                  { title: "Upcoming events", value: String(events.length).padStart(2, "0"), sub: `${joinedEvents.length} joined by you`, icon: "◎", color: "bg-amber-50 text-amber-700", target: "Campus Events" as Section },
                ].map((card) => (
                  <button key={card.title} onClick={() => goTo(card.target)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{card.title}</span>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${card.color}`}>{card.icon}</span>
                    </div>
                    <div className="mt-4 text-3xl font-bold text-slate-900">{card.value}</div>
                    <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
                  </button>
                ))}
              </section>

              <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <section className={panelClass}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div><h2 className="text-lg font-bold text-slate-900">Recommended courses</h2><p className="text-sm text-slate-500">Build skills for your next step.</p></div>
                    <button onClick={() => goTo("Courses")} className="text-sm font-bold text-indigo-600">View all →</button>
                  </div>
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">▣</div>
                        <div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{course.title}</h3><p className="text-xs text-slate-500">{course.category} · {course.duration}</p></div>
                        <button onClick={() => toggleCourse(course.id)} className="text-sm font-semibold text-indigo-600">{savedCourses.includes(course.id) ? "Saved ✓" : "Save"}</button>
                      </div>
                    ))}
                  </div>
                </section>
                <section className={panelClass}>
                  <div className="mb-5 flex items-center justify-between">
                    <div><h2 className="text-lg font-bold text-slate-900">Upcoming events</h2><p className="text-sm text-slate-500">Stay involved in campus life.</p></div>
                    <button onClick={() => goTo("Campus Events")} className="text-sm font-bold text-indigo-600">View all →</button>
                  </div>
                  <div className="space-y-4">
                    {events.slice(0, 2).map((event) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><span className="text-xl font-bold leading-5">{event.day}</span><span className="mt-1 text-[10px] font-bold">{event.month}</span></div>
                        <div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{event.title}</h3><p className="text-xs text-slate-500">{event.time} · {event.location}</p><button onClick={() => joinEvent(event.id)} className="mt-1 text-xs font-bold text-indigo-600">{joinedEvents.includes(event.id) ? "Joined ✓" : "Join event →"}</button></div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className={panelClass}>
                <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Latest announcements</h2><button onClick={() => goTo("Announcements")} className="text-sm font-bold text-indigo-600">View all →</button></div>
                <div className="grid gap-3 md:grid-cols-3">
                  {announcements.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wide text-indigo-600">{item.date}</span><h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></div>)}
                </div>
              </section>
            </>
          )}

          {active === "My Profile" && (
            <>
              {sectionHeading("My Profile", "Maintain your academic information, skills, and career interests.")}
              <form onSubmit={saveProfile} className={panelClass + " max-w-4xl"}>
                <div className="mb-6 border-b border-slate-100 pb-5"><h2 className="text-xl font-bold text-slate-900">Student profile</h2><p className="mt-1 text-sm text-slate-500">Your information is saved in this browser for this demo.</p></div>
                <div className="grid gap-5 md:grid-cols-2">
                  {([
                    ["name", "Full name", "Enter your full name"],
                    ["college", "College / University", "Enter your institution"],
                    ["degree", "Degree and department", "e.g. B.Tech, ECE"],
                    ["year", "Graduation year", "e.g. 2027"],
                    ["skills", "Skills and interests", "e.g. Python, Embedded Systems"],
                  ] as const).map(([key, label, placeholder]) => <label key={key} className="block text-sm font-semibold text-slate-700">{label}<input required={key === "name"} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} placeholder={placeholder} className={fieldClass} /></label>)}
                  <label className="block text-sm font-semibold text-slate-700 md:col-span-2">About me<textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us briefly about your interests and goals..." rows={4} className={fieldClass} /></label>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3"><button className={primaryButton} type="submit">Save profile</button><button type="button" className={secondaryButton} onClick={() => { setProfile(initialProfile); notify("Fields cleared. Save to update your profile."); }}>Clear fields</button></div>
              </form>
            </>
          )}

          {active === "Courses" && (
            <>
              {sectionHeading("Courses", "Discover learning resources and save courses you want to explore.")}
              {searchBox("Search courses or skills...")}
              {filteredCourses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredCourses.map((item) => listingCard(item, "course"))}</div> : <p className={panelClass}>No matching courses found. Try a different search.</p>}
              <section className={panelClass}><h2 className="font-bold text-slate-900">Your saved courses ({savedCourses.length})</h2><div className="mt-3 flex flex-wrap gap-2">{courses.filter((item) => savedCourses.includes(item.id)).map((item) => <span key={item.id} className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">{item.title}</span>)}{savedCourses.length === 0 && <p className="text-sm text-slate-500">Save a course to see it here.</p>}</div></section>
            </>
          )}

          {active === "Opportunities" && (
            <>
              {sectionHeading("Opportunities", "Find projects, mentoring, workshops, and ways to grow your experience.")}
              {searchBox("Search opportunities...")}
              {filteredOpportunities.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredOpportunities.map((item) => listingCard(item, "opportunity"))}</div> : <p className={panelClass}>No matching opportunities found.</p>}
            </>
          )}

          {active === "Internships & Jobs" && (
            <>
              {sectionHeading("Internships & Jobs", "Explore sample career listings and keep track of applications you record.")}
              {searchBox("Search jobs, roles, or skills...")}
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">These are demonstration listings. Applying here records your selection locally; it does not submit an application to an employer.</div>
              {filteredJobs.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredJobs.map((item) => listingCard(item, "job"))}</div> : <p className={panelClass}>No matching jobs found.</p>}
              <section className={panelClass}><h2 className="font-bold text-slate-900">Your application tracker</h2><p className="mt-1 text-sm text-slate-500">{applications.length} demo application(s) recorded.</p><div className="mt-4 space-y-3">{[...jobs, ...opportunities].filter((item) => applications.includes(item.id)).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"><div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="text-xs text-slate-500">{item.category}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Recorded</span></div>)}{applications.length === 0 && <p className="text-sm text-slate-500">Your recorded applications will appear here.</p>}</div></section>
            </>
          )}

          {active === "Campus Events" && (
            <>
              {sectionHeading("Campus Events", "Discover student activities and join events that interest you.")}
              <div className="grid gap-5 xl:grid-cols-2">
                {events.map((event) => <article key={event.id} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><span className="text-2xl font-bold leading-7">{event.day}</span><span className="text-xs font-bold">{event.month}</span></div><div className="min-w-0 flex-1"><h2 className="text-lg font-bold text-slate-900">{event.title}</h2><p className="mt-1 text-sm text-slate-500">{event.time} · {event.location}</p><p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p><button onClick={() => joinEvent(event.id)} className={"mt-4 " + (joinedEvents.includes(event.id) ? secondaryButton : primaryButton)}>{joinedEvents.includes(event.id) ? "✓ Joined" : "Join event"}</button></div></article>)}
              </div>
              <section className={panelClass}><h2 className="font-bold text-slate-900">Your events</h2><p className="mt-1 text-sm text-slate-500">You have joined {joinedEvents.length} event(s).</p></section>
            </>
          )}

          {active === "Announcements" && (
            <>
              {sectionHeading("Announcements", "Keep up with campus news, learning updates, and important reminders.")}
              <div className="space-y-4">{announcements.map((item) => <article key={item.id} className={panelClass}><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">▤</span><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.date}</p><h2 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></div></div></article>)}</div>
            </>
          )}

          {active === "Community" && (
            <>
              {sectionHeading("Community", "Share learning goals, ideas, and project updates with fellow students.")}
              <form onSubmit={publishPost} className={panelClass}><label htmlFor="community-post" className="font-semibold text-slate-900">Create a post</label><textarea id="community-post" value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="What are you learning or working on?" rows={3} className={fieldClass} /><div className="mt-3 flex justify-end"><button type="submit" className={primaryButton} disabled={!postText.trim()}>Publish post</button></div></form>
              <div className="space-y-4">{posts.map((post) => <article key={post.id} className={panelClass}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{post.author.slice(0, 1).toUpperCase()}</div><div><p className="font-semibold text-slate-900">{post.author}</p><p className="text-xs text-slate-500">{post.date}</p></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.text}</p></article>)}</div>
              <p className="text-xs text-slate-500">Demo community: posts are stored locally in this browser and are not shared with other students.</p>
            </>
          )}

          {active === "Messages" && (
            <>
              {sectionHeading("Messages", "A simple local demo conversation area for the student portal.")}
              <section className={panelClass + " max-w-3xl"}>
                <div className="mb-5 border-b border-slate-100 pb-4"><h2 className="text-lg font-bold text-slate-900">My conversation</h2><p className="text-sm text-slate-500">Messages you enter are saved in this browser only.</p></div>
                <div className="mb-5 min-h-48 space-y-3">
                  {messages.length === 0 && <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No messages yet. Write a message below to try this feature.</div>}
                  {messages.map((message) => <div key={message.id} className="rounded-xl border border-slate-100 p-4"><p className="text-xs font-bold text-indigo-600">{message.from}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.text}</p></div>)}
                </div>
                <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="message-input">Write a message</label><input id="message-input" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Write your message..." className={fieldClass + " mt-0 flex-1"} /><button type="submit" disabled={!messageText.trim()} className={primaryButton}>Send message</button></form>
              </section>
            </>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs text-slate-500 sm:px-8">
          © 2026 Zyngram Campus Hub · Learn, connect and grow.
          <p className="mt-1">Student demonstration application. Sample content and local browser storage are used.</p>
        </footer>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-slate-950 p-2 lg:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {navigation.map((item) => <button key={item.name} onClick={() => goTo(item.name)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${active === item.name ? "bg-cyan-400 text-slate-950" : "text-white hover:bg-slate-800"}`}>{item.name}</button>)}
        </div>
      </div>
    </div>
  );
}
