// src/useStore.js
const KEY = "lrb_store_v1";

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const seed = {
  sessions: [], // {date, ratio:"3:6", durationSec, tag:"dinghy|lesson|timer", note}
  challenge: { daysDone: [], total: 14 }, // array of YYYY-MM-DD
  victories: [], // {date, text}
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || seed;
  } catch {
    return seed;
  }
}
function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getState() {
  return load();
}

export function saveSession({ ratio, durationSec, tag, note }) {
  const s = load();
  s.sessions.push({
    date: todayKey(),
    ratio,
    durationSec,
    tag,
    note: note || "",
  });
  save(s);
}

export function markChallengeToday() {
  const s = load();
  const t = todayKey();
  if (!s.challenge.daysDone.includes(t)) {
    s.challenge.daysDone.push(t);
    save(s);
  }
}

export function addVictory(text) {
  const s = load();
  s.victories.push({ date: todayKey(), text });
  save(s);
}

export function getTodayChecklist() {
  const s = load();
  const t = todayKey();
  const todays = s.sessions.filter((x) => x.date === t);
  return {
    dinghy: todays.some((x) => x.tag === "dinghy"),
    lesson: todays.some((x) => x.tag === "lesson"),
    timer: todays.some((x) => x.tag === "timer"),
    challengeDay: s.challenge.daysDone.length,
    victories: s.victories.filter((v) => v.date === t),
  };
}

export function getStreak() {
  const s = load();
  const dates = Array.from(new Set(s.sessions.map((x) => x.date))).sort();
  if (dates.length === 0) return 0;

  // walk backward from today; count consecutive days with any session
  const day = 24 * 60 * 60 * 1000;
  const has = new Set(dates);
  let streak = 0;
  let d = new Date(todayKey());
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (!has.has(k)) break;
    streak++;
    d = new Date(d.getTime() - day);
  }
  return streak;
}
export function exportCSV() {
  const s = getState();
  const rows = [
    ["date", "tag", "ratio", "durationSec", "note"],
    ...s.sessions.map((x) => [
      x.date,
      x.tag,
      x.ratio,
      x.durationSec,
      (x.note || "").replace(/\n/g, " "),
    ]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lazy-river-sessions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export function getTodaySessionCount() {
  const s = getState();
  const t = new Date().toISOString().slice(0, 10);
  return s.sessions.filter((x) => x.date === t).length;
}
export function exportSessionsCSV() {
  const s = getState();
  if (!s.sessions || s.sessions.length === 0) return "";
  const header = "date,tag,ratio,durationSec,note\n";
  const rows = s.sessions.map((sess) =>
    [
      sess.date,
      sess.tag,
      sess.ratio,
      sess.durationSec,
      (sess.note || "").replace(/,/g, ";"),
    ].join(",")
  );
  return header + rows.join("\n");
}
export function resetAll() {
  localStorage.removeItem("lrb_store_v1");
}
