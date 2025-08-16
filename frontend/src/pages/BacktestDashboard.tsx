import React, { useEffect, useState } from "react";

interface BacktestMetric {
  league_id: number;
  league_name: string;
  market: string;
  log_loss: number;
  brier_score: number;
  calibration_slope: number;
  sample_count: number;
  last_updated: string;
}

export default function BacktestDashboard() {
  const [metrics, setMetrics] = useState<BacktestMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;

  useEffect(() => {
    fetch(`${apiBase}/api/backtest/metrics`)
      .then(r => r.json())
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getScoreColor = (score: number, type: "loss" | "calibration") => {
    if (type === "loss") {
      if (score < 0.5) return "#28a745";
      if (score < 0.7) return "#ffc107";
      return "#dc3545";
    } else {
      if (Math.abs(score - 1.0) < 0.1) return "#28a745";
      if (Math.abs(score - 1.0) < 0.2) return "#ffc107";
      return "#dc3545";
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Backtest Dashboard</h2>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Metriken über Zeit, Reliability-Plot und Rolling-Backtests pro Liga.
      </p>

      {loading && <p>Lade Backtest-Metriken...</p>}

      {!loading && metrics.length === 0 && (
        <div style={{ 
          padding: 24, 
          border: "1px solid #ddd", 
          borderRadius: 8, 
          backgroundColor: "#f8f9fa",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Noch keine Backtest-Daten verfügbar. Modelle müssen erst trainiert und kalibriert werden.
          </p>
        </div>
      )}

      {metrics.length > 0 && (
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Model Performance Metriken</h3>
          <div style={{ display: "grid", gap: "16px" }}>
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>
                    {metric.league_name} - {metric.market}
                  </h4>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    {new Date(metric.last_updated).toLocaleDateString("de-DE")}
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: 4 }}>Log Loss</div>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "500",
                      color: getScoreColor(metric.log_loss, "loss")
                    }}>
                      {metric.log_loss.toFixed(3)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: 4 }}>Brier Score</div>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "500",
                      color: getScoreColor(metric.brier_score, "loss")
                    }}>
                      {metric.brier_score.toFixed(3)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: 4 }}>Kalibrierung</div>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "500",
                      color: getScoreColor(metric.calibration_slope, "calibration")
                    }}>
                      {metric.calibration_slope.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: 4 }}>Samples</div>
                    <div style={{ fontSize: "16px", fontWeight: "500" }}>
                      {metric.sample_count.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Reliability Plot (Placeholder)</h3>
        <div style={{
          height: 300,
          border: "1px solid #ddd",
          borderRadius: 8,
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7
        }}>
          <p style={{ margin: 0 }}>
            Reliability Plot wird hier angezeigt (benötigt Charting-Library wie D3 oder Recharts)
          </p>
        </div>
      </div>
    </div>
  );
}
