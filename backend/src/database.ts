import pkg from "pg";
const { Client } = pkg;

export function getDbClient() {
  return new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "app",
    password: process.env.DB_PASSWORD || "app",
    database: process.env.DB_NAME || "app"
  });
}

export async function initializeDatabase() {
  const client = getDbClient();
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sport VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id SERIAL PRIMARY KEY,
        league_id INTEGER REFERENCES leagues(id),
        year INTEGER NOT NULL,
        start_date DATE,
        end_date DATE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        league_id INTEGER REFERENCES leagues(id),
        name VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS fixtures (
        id SERIAL PRIMARY KEY,
        league_id INTEGER REFERENCES leagues(id),
        season_id INTEGER REFERENCES seasons(id),
        date TIMESTAMP NOT NULL,
        home_id INTEGER REFERENCES teams(id),
        away_id INTEGER REFERENCES teams(id),
        status VARCHAR(50),
        goals_home INTEGER,
        goals_away INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS elo_snapshots (
        date DATE NOT NULL,
        league_id INTEGER REFERENCES leagues(id),
        team_id INTEGER REFERENCES teams(id),
        elo DECIMAL(10,2) NOT NULL,
        PRIMARY KEY (date, league_id, team_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS features (
        fixture_id INTEGER REFERENCES fixtures(id) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        fixture_id INTEGER REFERENCES fixtures(id),
        model_version VARCHAR(100) NOT NULL,
        market VARCHAR(50) NOT NULL,
        selection VARCHAR(50) NOT NULL,
        prob DECIMAL(5,4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (fixture_id, model_version, market, selection)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS calibration (
        league_id INTEGER REFERENCES leagues(id),
        market VARCHAR(50) NOT NULL,
        version VARCHAR(100) NOT NULL,
        mapping_blob JSONB NOT NULL,
        PRIMARY KEY (league_id, market, version)
      );
    `);

    console.log("[database] Schema initialized successfully");
    await client.end();
  } catch (error) {
    console.error("[database] Schema initialization failed:", error);
    await client.end();
    throw error;
  }
}
