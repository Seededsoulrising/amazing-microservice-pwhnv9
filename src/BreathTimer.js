// src/BreathTimer.js
import { useEffect, useRef, useState } from "react";

/**
 * Ultra-stable breath timer:
 * - One setInterval ticking every 1000ms
 * - Values kept in refs (never stale)
 * - No audio / vibration (we can add back later)
 */
export default function BreathTimer({
  inhale = 3,
  exhale = 6,
  rounds = 3,
  onDone,
}) {
  // UI state (display only)
  const [phase, setPhase] = useState("in"); // "in" | "out" | "done"
  const [count, setCount] = useState(1);
  const [round, setRound] = useState(1);

  // Logic refs (source of truth for the loop)
  const phaseRef = useRef("in");
  const countRef = useRef(1);
  const roundRef = useRef(1);

  const startedRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    intervalRef.current = setInterval(() => {
      const isIn = phaseRef.current === "in";
      const max = isIn ? inhale : exhale;

      // advance within the current phase
      if (countRef.current < max) {
        const next = countRef.current + 1;
        countRef.current = next;
        setCount(next);
        return;
      }

      // phase boundary
      if (isIn) {
        // switch to out-breath
        phaseRef.current = "out";
        setPhase("out");
        countRef.current = 1;
        setCount(1);
        return;
      }

      // finished an out-breath => completed one round
      if (roundRef.current < rounds) {
        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        setRound(nextRound);

        phaseRef.current = "in";
        setPhase("in");
        countRef.current = 1;
        setCount(1);
        return;
      }

      // all rounds done
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      phaseRef.current = "done";
      setPhase("done");
      onDone && onDone();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inhale, exhale, rounds, onDone]);

  return (
    <div style={{ margin: "1em 0" }}>
      {phase !== "done" ? (
        <>
          <p style={{ fontSize: 18, margin: 0 }}>
            {phase === "in" ? "In" : "Out"} {count} of{" "}
            {phase === "in" ? inhale : exhale}
          </p>
          <p style={{ opacity: 0.7, marginTop: 4 }}>
            Round {round} of {rounds} • keep it smooth
          </p>
        </>
      ) : (
        <p>Timer finished.</p>
      )}
    </div>
  );
}
