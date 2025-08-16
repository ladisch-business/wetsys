import React, { useEffect, useState } from "react";

interface League {
  id: number;
  name: string;
  sport: string;
  country: string;
}

interface Fixture {
  id: number;
  date: string;
  home_team: string;
  away_team: string;
  league_name: string;
  status: string;
}

interface Prediction {
  market: string;
  selection: string;
  prob: number;
}

export default function LeagueDashboard() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction[]>>({});
  const [loading, setLoading] = useState(false);

  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;

  useEffect(() => {
    fetch(`${apiBase}/api/leagues`)
      .then(r => r.json())
      .then(setLeagues)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      setLoading(true);
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      fetch(`${apiBase}/api/fixtures?leagueId=${selectedLeague}&from=${from}&to=${to}`)
        .then(r => r.json())
        .then(fixtures => {
          setFixtures(fixtures);
          fixtures.forEach((fixture: Fixture) => {
            fetch(`${apiBase}/api/predictions/${fixture.id}`)
              .then(r => r.json())
              .then(preds => {
                setPredictions(prev => ({ ...prev, [fixture.id]: preds }));
              })
              .catch(console.error);
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedLeague]);

  const getConfidenceBadge = (prob: number) => {
    if (prob > 0.7) return { text: "Hoch", color: "#28a745" };
    if (prob > 0.5) return { text: "Mittel", color: "#ffc107" };
    return { text: "Niedrig", color: "#dc3545" };
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Liga Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Liste kommender Spiele mit Wahrscheinlichkeiten, Picks und Konfidenz-Badges.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "500" }}>
          Liga auswählen:
        </label>
        <select
          value={selectedLeague || ""}
          onChange={e => setSelectedLeague(Number(e.target.value) || null)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          <option value="">-- Liga wählen --</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>
              {league.name} ({league.country})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Lade Spiele...</p>}

      {fixtures.length > 0 && (
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Kommende Spiele (nächste 14 Tage)</h3>
          <div style={{ display: "grid", gap: "16px" }}>
            {fixtures.map(fixture => {
              const fixturePreds = predictions[fixture.id] || [];
              const homeWinProb = fixturePreds.find(p => p.market === "1X2" && p.selection === "1")?.prob || 0;
              const confidence = getConfidenceBadge(Math.max(...fixturePreds.map(p => p.prob)));

              return (
                <div
                  key={fixture.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                        {fixture.home_team} vs {fixture.away_team}
                      </h4>
                      <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
                        {new Date(fixture.date).toLocaleDateString("de-DE")} - {fixture.status}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: confidence.color,
                          color: "white"
                        }}
                      >
                        {confidence.text}
                      </span>
                    </div>
                  </div>
                  
                  {fixturePreds.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <h5 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Wahrscheinlichkeiten:</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                        {fixturePreds.slice(0, 6).map((pred, idx) => (
                          <div key={idx} style={{ fontSize: "12px" }}>
                            <strong>{pred.market} {pred.selection}:</strong> {(pred.prob * 100).toFixed(1)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedLeague && fixtures.length === 0 && !loading && (
        <p style={{ opacity: 0.7 }}>Keine kommenden Spiele in den nächsten 14 Tagen gefunden.</p>
      )}
    </div>
  );
}
