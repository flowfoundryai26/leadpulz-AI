"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#070a12", color: "#e8ebf3", fontFamily: "system-ui", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#7d869c", marginTop: 8 }}>{error.message || "An unexpected error occurred."}</p>
          <button onClick={reset} style={{ marginTop: 24, background: "#6161ff", color: "#fff", border: 0, borderRadius: 8, padding: "10px 18px", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
