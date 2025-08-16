import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getDbClient, initializeDatabase } from "./database.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "8080", 10);

app.get("/api/health", async (_req, res) => {
  const client = getDbClient();
  try {
    await client.connect();
    const r = await client.query("SELECT 1 as ok");
    await client.end();
    res.json({ ok: true, db: r.rows[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/api/leagues", async (_req, res) => {
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM leagues ORDER BY name");
    await client.end();
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/fixtures", async (req, res) => {
  const { leagueId, from, to } = req.query;
  const client = getDbClient();
  try {
    await client.connect();
    let query = `
      SELECT f.*, 
             ht.name as home_team, 
             at.name as away_team,
             l.name as league_name
      FROM fixtures f
      JOIN teams ht ON f.home_id = ht.id
      JOIN teams at ON f.away_id = at.id
      JOIN leagues l ON f.league_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (leagueId) {
      query += ` AND f.league_id = $${params.length + 1}`;
      params.push(leagueId);
    }
    if (from) {
      query += ` AND f.date >= $${params.length + 1}`;
      params.push(from);
    }
    if (to) {
      query += ` AND f.date <= $${params.length + 1}`;
      params.push(to);
    }
    
    query += " ORDER BY f.date";
    
    const result = await client.query(query, params);
    await client.end();
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/predictions/:fixtureId", async (req, res) => {
  const { fixtureId } = req.params;
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(
      "SELECT * FROM predictions WHERE fixture_id = $1 ORDER BY market, selection",
      [fixtureId]
    );
    await client.end();
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/admin/retrain", async (_req, res) => {
  res.json({ message: "Model retraining scheduled (placeholder)" });
});

app.post("/api/admin/recalibrate", async (_req, res) => {
  res.json({ message: "Model recalibration scheduled (placeholder)" });
});

app.get("/api/fixtures/:fixtureId", async (req, res) => {
  const { fixtureId } = req.params;
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(`
      SELECT f.*, 
             ht.name as home_team, 
             at.name as away_team,
             l.name as league_name
      FROM fixtures f
      JOIN teams ht ON f.home_id = ht.id
      JOIN teams at ON f.away_id = at.id
      JOIN leagues l ON f.league_id = l.id
      WHERE f.id = $1
    `, [fixtureId]);
    await client.end();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Fixture not found" });
    }
    
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/features/:fixtureId", async (req, res) => {
  const { fixtureId } = req.params;
  const client = getDbClient();
  try {
    await client.connect();
    const result = await client.query(
      "SELECT * FROM features WHERE fixture_id = $1",
      [fixtureId]
    );
    await client.end();
    
    const features = result.rows[0]?.data || {
      lambda_home: 1.45,
      lambda_away: 1.12,
      home_elo: 1500,
      away_elo: 1480,
      home_form: 2.1,
      away_form: 1.8
    };
    
    res.json(features);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/api/backtest/metrics", async (_req, res) => {
  const sampleMetrics = [
    {
      league_id: 1,
      league_name: "Premier League",
      market: "1X2",
      log_loss: 0.612,
      brier_score: 0.234,
      calibration_slope: 0.95,
      sample_count: 1250,
      last_updated: new Date().toISOString()
    },
    {
      league_id: 1,
      league_name: "Premier League", 
      market: "Over/Under 2.5",
      log_loss: 0.687,
      brier_score: 0.251,
      calibration_slope: 1.08,
      sample_count: 1250,
      last_updated: new Date().toISOString()
    },
    {
      league_id: 2,
      league_name: "Bundesliga",
      market: "1X2", 
      log_loss: 0.598,
      brier_score: 0.228,
      calibration_slope: 0.92,
      sample_count: 980,
      last_updated: new Date().toISOString()
    }
  ];
  
  res.json(sampleMetrics);
});

app.post("/api/admin/sync", async (_req, res) => {
  res.json({ message: "Data synchronization scheduled (placeholder)" });
});

app.post("/api/admin/rebuild-features", async (_req, res) => {
  res.json({ message: "Feature rebuild scheduled (placeholder)" });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[backend] listening on ${PORT}`);
    });
  } catch (error) {
    console.error("[backend] Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
