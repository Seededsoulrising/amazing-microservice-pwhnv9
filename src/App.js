// src/App.js
import { useState } from "react";
import lessons from "./lessons.json";
import BreathTimer from "./BreathTimer";
import Certificate from "./Certificate";
import {
  saveSession,
  markChallengeToday,
  getTodayChecklist,
  getStreak,
  addVictory,
  getState,
  getTodaySessionCount,
  exportSessionsCSV,
  resetAll,
} from "./useStore";

export default function App() {
  const [page, setPage] = useState("home");
  const [toast, setToast] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // silly disclaimers rotation
  const disclaimers = [
    "Your data stays local. This isn’t health care, it’s nostril care.",
    "Saved here, not in the cloud. No HIPAA, just hiccups.",
    "Stored on this device. Not medical advice, but it may lower drama per minute.",
    "No servers, no side effects. Just you and your alveoli.",
    "This app is not FDA-approved, unless the F stands for Floating Downstream Association.",
  ];
  const disclaimer =
    disclaimers[Math.floor(Math.random() * disclaimers.length)];

  // toast (top-center, 2s)
  const Toast = ({ msg }) =>
    !msg ? null : (
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: 14,
          transform: "translateX(-50%)",
          background: "#111",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,.25)",
          zIndex: 999999,
          fontSize: 14,
        }}
      >
        {msg}
      </div>
    );

  function ping(msg = "Saved. Nice drift.") {
    setToast(msg);
    setLastSavedAt(new Date());
    clearTimeout(window.__lrb_to);
    window.__lrb_to = setTimeout(() => setToast(null), 2000);
  }

  const streak = getStreak();
  const sessionsToday = getTodaySessionCount();
  const challengeDay = getTodayChecklist().challengeDay;

  return (
    <div className="App" style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Lazy River Breathing</h1>

      {page === "home" && (
        <>
          <p>
            Welcome back to the river. Tiny sessions. Anywhere that doesn’t hate
            quiet.
          </p>
          <div>
            <button onClick={() => setPage("dinghy")}>
              🚣 Emergency Dinghy
            </button>
            <button onClick={() => setPage("lessons")}>📘 Lessons 1–3</button>
            <button onClick={() => setPage("drift")}>📅 Daily Drift</button>
            <button onClick={() => setPage("timer")}>⏱️ Ratio Timer</button>
            <button onClick={() => setPage("log")}>🗒️ Log</button>
            {challengeDay >= 14 && (
              <button onClick={() => setPage("cert")}>
                🏅 Get Certificate
              </button>
            )}
          </div>
          <p style={{ opacity: 0.7, marginTop: 8 }}>
            Streak: {streak} day{streak === 1 ? "" : "s"}
          </p>
          <p style={{ opacity: 0.7, marginTop: 4 }}>
            Sessions today: {sessionsToday}
          </p>
          {lastSavedAt && (
            <p style={{ opacity: 0.7, marginTop: 4 }}>
              Last saved: {lastSavedAt.toLocaleTimeString()}
            </p>
          )}
          <p style={{ opacity: 0.6, fontSize: 12, marginTop: 12 }}>
            {disclaimer}
          </p>
          <button
            style={{ marginTop: 10 }}
            onClick={() => {
              resetAll();
              location.reload();
            }}
          >
            🧹 Reset
          </button>
        </>
      )}

      {page === "dinghy" && (
        <EmergencyDinghy onBack={() => setPage("home")} ping={ping} />
      )}
      {page === "lessons" && (
        <Lessons lessons={lessons} onBack={() => setPage("home")} ping={ping} />
      )}
      {page === "drift" && <DailyDrift onBack={() => setPage("home")} />}
      {page === "timer" && <Timer onBack={() => setPage("home")} ping={ping} />}
      {page === "log" && <Log onBack={() => setPage("home")} />}
      {page === "cert" && <Certificate onBack={() => setPage("home")} />}

      <Toast msg={toast} />
    </div>
  );
}

/* ---------------- Emergency Dinghy ---------------- */
function EmergencyDinghy({ onBack, ping }) {
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div>
      <h2>Emergency Dinghy</h2>

      {!done ? (
        <>
          <p>Three breaths. In 3, out 6. No drama.</p>
          <BreathTimer
            inhale={3}
            exhale={6}
            rounds={3}
            onDone={() => setDone(true)}
          />
        </>
      ) : (
        <>
          <p>Dinghy deployed. You stayed in the boat.</p>
          <textarea
            placeholder="Quick note (optional)… e.g., Parking lot panic deflated."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{ width: "100%", maxWidth: 420 }}
          />
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                saveSession({
                  ratio: "3:6",
                  durationSec: 3 * (3 + 6),
                  tag: "dinghy",
                  note,
                });
                markChallengeToday();
                ping("Saved. Nice drift.");
                onBack();
              }}
            >
              Save
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={onBack}>⬅ Back</button>
      </div>
    </div>
  );
}

/* ---------------- Lessons ---------------- */
function Lessons({ lessons, onBack, ping }) {
  return (
    <div>
      <h2>Lessons 1–3</h2>
      {lessons.map((l) => (
        <div
          key={l.id}
          style={{
            margin: "1em auto",
            border: "1px solid #ccc",
            padding: "10px",
            textAlign: "left",
            maxWidth: 640,
          }}
        >
          <h3>{l.title}</h3>
          <p>
            <strong>What to know:</strong> {l.know}
          </p>
          <p>
            <strong>Try it:</strong> {l.try}
          </p>
          <ul>
            {l.everyday.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <button
            onClick={() => {
              saveSession({
                ratio: "free",
                durationSec: 90,
                tag: "lesson",
                note: `Completed ${l.title}`,
              });
              markChallengeToday();
              ping("Saved. Nice drift.");
              onBack();
            }}
          >
            Mark Complete
          </button>
        </div>
      ))}
      <button onClick={onBack}>⬅ Back</button>
    </div>
  );
}

/* ---------------- Daily Drift ---------------- */
function DailyDrift({ onBack }) {
  const c = getTodayChecklist();
  const [victory, setVictory] = useState("");

  return (
    <div>
      <h2>Daily Drift</h2>
      <div style={{ maxWidth: 480, marginInline: "auto", textAlign: "left" }}>
        <p>
          <strong>Today</strong>
        </p>
        <label>
          <input type="checkbox" checked={c.dinghy} readOnly /> One Dinghy run
        </label>
        <br />
        <label>
          <input type="checkbox" checked={c.lesson} readOnly /> One 60–120s
          lesson
        </label>
        <br />
        <label>
          <input type="checkbox" checked={c.timer} readOnly /> One ratio timer
        </label>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              markChallengeToday();
              alert("Marked today complete.");
            }}
          >
            Mark Today Complete ({c.challengeDay}/14)
          </button>
        </div>

        <hr />
        <p>
          <strong>Petty Victory Log</strong>
        </p>
        <ul>
          {c.victories.map((v, i) => (
            <li key={i}>{v.text}</li>
          ))}
        </ul>
        <input
          placeholder="e.g., Held the line at the post office."
          value={victory}
          onChange={(e) => setVictory(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              if (victory.trim()) {
                addVictory(victory.trim());
                setVictory("");
              }
            }}
          >
            Add Victory
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={onBack}>⬅ Back</button>
      </div>
    </div>
  );
}

/* ---------------- Ratio Timer ---------------- */
function Timer({ onBack, ping }) {
  const [preset, setPreset] = useState({ in: 2, out: 4 });
  const [running, setRunning] = useState(false);

  const presets = [
    { label: "2:4", in: 2, out: 4 },
    { label: "3:6", in: 3, out: 6 },
    { label: "4:8", in: 4, out: 8 },
  ];

  return (
    <div>
      <h2>Ratio Timer</h2>

      {!running && (
        <div style={{ marginBottom: 12 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset({ in: p.in, out: p.out })}
              style={{
                fontWeight:
                  preset.in === p.in && preset.out === p.out ? "700" : "400",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {!running ? (
        <button onClick={() => setRunning(true)}>Start</button>
      ) : (
        <BreathTimer
          inhale={preset.in}
          exhale={preset.out}
          rounds={3}
          onDone={() => {
            saveSession({
              ratio: `${preset.in}:${preset.out}`,
              durationSec: 3 * (preset.in + preset.out),
              tag: "timer",
            });
            markChallengeToday();
            ping("Saved. Nice drift.");
            onBack();
          }}
        />
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={onBack}>⬅ Back</button>
      </div>
    </div>
  );
}

/* ---------------- Session Log ---------------- */
function Log({ onBack }) {
  const state = getState();
  return (
    <div>
      <h2>Session Log</h2>
      {state.sessions.length === 0 && <p>No sessions yet.</p>}
      {state.sessions.map((s, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            margin: "8px auto",
            maxWidth: 520,
            textAlign: "left",
          }}
        >
          <div>
            <strong>{s.date}</strong> • {s.tag} • {s.ratio}
          </div>
          {s.note && (
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              <em>{s.note}</em>
            </div>
          )}
          <div style={{ opacity: 0.6, fontSize: 12 }}>~{s.durationSec}s</div>
        </div>
      ))}
      {state.sessions.length > 0 && (
        <button
          onClick={() => {
            const csv = exportSessionsCSV();
            if (!csv) return;
            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "lazy-river-sessions.csv";
            link.click();
          }}
        >
          Export as CSV
        </button>
      )}
      <button onClick={onBack}>⬅ Back</button>
    </div>
  );
}
