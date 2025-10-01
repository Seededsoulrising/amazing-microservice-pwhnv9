import { getState } from "./useStore";

export default function Certificate({ onBack }) {
  const s = getState();
  const done = s.challenge?.daysDone?.length || 0;
  const date = new Date().toISOString().slice(0, 10);

  if (done < 14) {
    return (
      <div>
        <h2>14-Day Drift Certificate</h2>
        <p>{done}/14 done. Keep drifting.</p>
        <button onClick={onBack}>⬅ Back</button>
      </div>
    );
  }

  return (
    <div>
      <h2>14-Day Drift Certificate</h2>
      <canvas
        id="cert"
        width="900"
        height="500"
        style={{ maxWidth: "100%", border: "1px solid #eee" }}
      />
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => {
            const c = document.getElementById("cert");
            const ctx = c.getContext("2d");

            // background
            ctx.fillStyle = "#f7f9fb";
            ctx.fillRect(0, 0, c.width, c.height);

            // title
            ctx.fillStyle = "#111";
            ctx.font = "bold 36px system-ui, sans-serif";
            ctx.fillText("Lazy River Breathing", 40, 90);

            // subtitle
            ctx.font = "28px system-ui, sans-serif";
            ctx.fillText("14-Day Drift Complete", 40, 140);

            // date
            ctx.font = "18px system-ui, sans-serif";
            ctx.fillText(`Date: ${date}`, 40, 180);

            // ribbon
            ctx.fillStyle = "#0ea5e9";
            ctx.fillRect(40, 220, c.width - 80, 16);

            // footer wink
            ctx.fillStyle = "#444";
            ctx.font = "16px system-ui, sans-serif";
            ctx.fillText("Tiny breaths. Big plot twist.", 40, 270);

            // download
            const link = document.createElement("a");
            link.download = "lazy-river-certificate.png";
            link.href = c.toDataURL("image/png");
            link.click();
          }}
        >
          Save Certificate
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={onBack}>⬅ Back</button>
      </div>
    </div>
  );
}
