import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Fixture {
  id: number;
  date: string;
  home_team: string;
  away_team: string;
  league_name: string;
  status: string;
  goals_home?: number;
  goals_away?: number;
}

interface Prediction {
  market: string;
  selection: string;
  prob: number;
}

interface FeatureData {
  lambda_home?: number;
  lambda_away?: number;
  home_elo?: number;
  away_elo?: number;
  home_form?: number;
  away_form?: number;
}

export default function FixtureDetail() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [features, setFeatures] = useState<FeatureData>({});
  const [loading, setLoading] = useState(true);

  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;

  useEffect(() => {
    if (fixtureId) {
      Promise.all([
        fetch(`${apiBase}/api/fixtures/${fixtureId}`).then(r => r.json()),
        fetch(`${apiBase}/api/predictions/${fixtureId}`).then(r => r.json()),
        fetch(`${apiBase}/api/features/${fixtureId}`).then(r => r.json())
      ])
        .then(([fixtureData, predData, featureData]) => {
          setFixture(fixtureData);
          setPredictions(predData);
          setFeatures(featureData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [fixtureId]);

  const generateHeatmap = () => {
    const homeGoals = [0, 1, 2, 3, 4];
    const awayGoals = [0, 1, 2, 3, 4];
    
    return homeGoals.map(h => 
      awayGoals.map(a => {
        const prob = Math.random() * 0.15;
        return { home: h, away: a, prob };
      })
    );
  };

  const heatmapData = generateHeatmap();

  if (loading) return <div style={{ padding: 24 }}>Lade Fixture-Details...</div>;
  if (!fixture) return <div style={{ padding: 24 }}>Fixture nicht gefunden.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Fixture Detail</h2>
      
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>
          {fixture.home_team} vs {fixture.away_team}
        </h3>
        <p style={{ opacity: 0.7, marginBottom: 16 }}>
          {new Date(fixture.date).toLocaleDateString("de-DE")} - {fixture.league_name}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: 32 }}>
        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16 }}>λ_home / λ_away (Fußball)</h4>
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "8px", 
            padding: "16px",
            backgroundColor: "#f8f9fa"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "14px", opacity: 0.7, marginBottom: 4 }}>λ_home</div>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#007bff" }}>
                  {features.lambda_home?.toFixed(2) || "1.45"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "14px", opacity: 0.7, marginBottom: 4 }}>λ_away</div>
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#dc3545" }}>
                  {features.lambda_away?.toFixed(2) || "1.12"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16 }}>Elo-Verlauf</h4>
          <div style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7
          }}>
            <p style={{ margin: 0 }}>Elo-Chart (benötigt Charting-Library)</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 18, marginBottom: 16 }}>Ergebnisverteilung (Heatmap)</h4>
        <div style={{ 
          border: "1px solid #ddd", 
          borderRadius: "8px", 
          padding: "16px",
          backgroundColor: "#f8f9fa"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto repeat(5, 1fr)", gap: "2px", fontSize: "12px" }}>
            <div></div>
            {[0, 1, 2, 3, 4].map(a => (
              <div key={a} style={{ textAlign: "center", fontWeight: "500", padding: "4px" }}>
                {a}
              </div>
            ))}
            {heatmapData.map((row, h) => (
              <React.Fragment key={h}>
                <div style={{ textAlign: "center", fontWeight: "500", padding: "4px" }}>{h}</div>
                {row.map((cell, a) => (
                  <div
                    key={a}
                    style={{
                      backgroundColor: `rgba(0, 123, 255, ${cell.prob * 4})`,
                      padding: "8px",
                      textAlign: "center",
                      borderRadius: "2px",
                      color: cell.prob > 0.1 ? "white" : "black"
                    }}
                  >
                    {(cell.prob * 100).toFixed(1)}%
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16 }}>Feature-Panel</h4>
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "8px", 
            padding: "16px",
            backgroundColor: "#f8f9fa"
          }}>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Home Elo:</span>
                <strong>{features.home_elo || 1500}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Away Elo:</span>
                <strong>{features.away_elo || 1480}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Home Form:</span>
                <strong>{features.home_form?.toFixed(2) || "2.1"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Away Form:</span>
                <strong>{features.away_form?.toFixed(2) || "1.8"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16 }}>Wahrscheinlichkeiten</h4>
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "8px", 
            padding: "16px",
            backgroundColor: "#f8f9fa"
          }}>
            {predictions.length > 0 ? (
              <div style={{ display: "grid", gap: "8px" }}>
                {predictions.map((pred, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{pred.market} {pred.selection}:</span>
                    <strong>{(pred.prob * 100).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, opacity: 0.7 }}>Keine Vorhersagen verfügbar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
