import React, { useState } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, string>>({});

  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;

  const handleAction = async (action: string, endpoint: string) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    setResults(prev => ({ ...prev, [action]: "" }));

    try {
      const response = await fetch(`${apiBase}${endpoint}`, { method: "POST" });
      const result = await response.json();
      setResults(prev => ({ ...prev, [action]: result.message || JSON.stringify(result) }));
    } catch (error) {
      setResults(prev => ({ ...prev, [action]: `Fehler: ${error}` }));
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const adminActions = [
    {
      id: "retrain",
      title: "Modelle neu trainieren",
      description: "Startet das Re-Training aller Modelle (Poisson, MoV-Elo) für alle Ligen",
      endpoint: "/api/admin/retrain",
      buttonText: "Training starten"
    },
    {
      id: "recalibrate",
      title: "Kalibrierung aktualisieren",
      description: "Führt eine neue Kalibrierung der Modelle durch (Isotonic Regression)",
      endpoint: "/api/admin/recalibrate",
      buttonText: "Kalibrierung starten"
    },
    {
      id: "sync",
      title: "Daten synchronisieren",
      description: "Lädt aktuelle Fixtures und Ergebnisse von API-Football/Basketball",
      endpoint: "/api/admin/sync",
      buttonText: "Sync starten"
    },
    {
      id: "features",
      title: "Features neu berechnen",
      description: "Berechnet Features für alle Fixtures neu (Elo, Form, etc.)",
      endpoint: "/api/admin/rebuild-features",
      buttonText: "Features berechnen"
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Admin Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Buttons/Endpoints zum Re-Train/Reco/Kalibrierung triggern und geplante Jobs verwalten.
      </p>

      <div style={{ display: "grid", gap: "24px" }}>
        {adminActions.map(action => (
          <div
            key={action.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              backgroundColor: "#f8f9fa"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{action.title}</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "14px" }}>{action.description}</p>
              </div>
              <button
                onClick={() => handleAction(action.id, action.endpoint)}
                disabled={loading[action.id]}
                style={{
                  padding: "8px 16px",
                  backgroundColor: loading[action.id] ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading[action.id] ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginLeft: "16px"
                }}
              >
                {loading[action.id] ? "Läuft..." : action.buttonText}
              </button>
            </div>
            
            {results[action.id] && (
              <div style={{
                marginTop: 12,
                padding: "12px",
                backgroundColor: "#e9ecef",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "monospace"
              }}>
                {results[action.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Geplante Jobs</h3>
        <div style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: "#f8f9fa"
        }}>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Nightly Pull (Fixtures & Results)</span>
              <span style={{ opacity: 0.7, fontSize: "14px" }}>Täglich 02:00 UTC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Feature Build (Elo Update)</span>
              <span style={{ opacity: 0.7, fontSize: "14px" }}>Täglich 03:00 UTC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Weekly Train (Modelle)</span>
              <span style={{ opacity: 0.7, fontSize: "14px" }}>Sonntags 04:00 UTC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pre-match Predict</span>
              <span style={{ opacity: 0.7, fontSize: "14px" }}>Alle 6 Stunden</span>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: "14px", opacity: 0.7 }}>
            Jobs werden automatisch über Node-Cron im Backend ausgeführt (noch nicht implementiert).
          </p>
        </div>
      </div>
    </div>
  );
}
