import React, { useEffect, useState } from "react";

export default function SystemStatus() {
  const [status, setStatus] = useState<null | { ok: boolean; db?: boolean; error?: string }>(null);

  useEffect(() => {
    const url = `${window.location.protocol}//${window.location.hostname}:8080/api/health`;
    fetch(url)
      .then(r => r.json())
      .then(setStatus)
      .catch(e => setStatus({ ok: false, error: String(e) }));
  }, []);

  return (
    <div style={{ padding: 24, lineHeight: 1.4 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Systemstatus</h2>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Minimaler Skeleton zur Inbetriebnahme. Frontend (React/Vite) + Backend (Express) + PostgreSQL (Docker).
      </p>
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, maxWidth: 520 }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Backend & Database</h3>
        {!status && <p>Lade…</p>}
        {status && status.ok && <p>✅ Backend läuft. DB erreichbar: {String(status.db)}</p>}
        {status && !status.ok && (
          <div>
            <p>❌ Fehler</p>
            <pre style={{ whiteSpace: "pre-wrap" }}>{status.error}</pre>
          </div>
        )}
      </div>
      <p style={{ marginTop: 16, opacity: 0.7 }}>
        Nächste Schritte: Modelle/Jobs gemäß Lastenheft implementieren (Poisson/Elo, Kalibrierung, Backtests).
      </p>
    </div>
  );
}
