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

    await insertSampleData(client);

    console.log("[database] Schema initialized successfully");
    await client.end();
  } catch (error) {
    console.error("[database] Schema initialization failed:", error);
    await client.end();
    throw error;
  }
}

async function insertSampleData(client: any) {
  const existingLeagues = await client.query("SELECT COUNT(*) FROM leagues");
  if (parseInt(existingLeagues.rows[0].count) > 0) {
    console.log("[database] Sample data already exists, skipping insertion");
    return;
  }

  await client.query(`
    INSERT INTO leagues (name, sport, country) VALUES 
    ('Premier League', 'football', 'England'),
    ('Bundesliga', 'football', 'Germany'),
    ('La Liga', 'football', 'Spain'),
    ('NBA', 'basketball', 'USA')
  `);

  await client.query(`
    INSERT INTO seasons (league_id, year, start_date, end_date) VALUES 
    (1, 2024, '2024-08-17', '2025-05-25'),
    (2, 2024, '2024-08-23', '2025-05-17'),
    (3, 2024, '2024-08-18', '2025-05-25'),
    (4, 2024, '2024-10-15', '2025-04-14')
  `);

  await client.query(`
    INSERT INTO teams (league_id, name) VALUES 
    (1, 'Manchester City'), (1, 'Arsenal'), (1, 'Liverpool'), (1, 'Chelsea'),
    (2, 'Bayern Munich'), (2, 'Borussia Dortmund'), (2, 'RB Leipzig'), (2, 'Bayer Leverkusen'),
    (3, 'Real Madrid'), (3, 'Barcelona'), (3, 'Atletico Madrid'), (3, 'Sevilla'),
    (4, 'Los Angeles Lakers'), (4, 'Boston Celtics'), (4, 'Golden State Warriors'), (4, 'Miami Heat')
  `);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);

  await client.query(`
    INSERT INTO fixtures (league_id, season_id, date, home_id, away_id, status) VALUES 
    (1, 1, $1, 1, 2, 'scheduled'),
    (1, 1, $2, 3, 4, 'scheduled'),
    (2, 2, $2, 5, 6, 'scheduled'),
    (2, 2, $3, 7, 8, 'scheduled'),
    (3, 3, $3, 9, 10, 'scheduled'),
    (4, 4, $1, 13, 14, 'scheduled')
  `, [tomorrow.toISOString(), dayAfter.toISOString(), threeDays.toISOString()]);

  await client.query(`
    INSERT INTO predictions (fixture_id, model_version, market, selection, prob) VALUES 
    (1, 'v1.0', '1X2', '1', 0.45), (1, 'v1.0', '1X2', 'X', 0.28), (1, 'v1.0', '1X2', '2', 0.27),
    (1, 'v1.0', 'Over/Under 2.5', 'Over', 0.62), (1, 'v1.0', 'Over/Under 2.5', 'Under', 0.38),
    (1, 'v1.0', 'BTTS', 'Yes', 0.58), (1, 'v1.0', 'BTTS', 'No', 0.42),
    (2, 'v1.0', '1X2', '1', 0.38), (2, 'v1.0', '1X2', 'X', 0.31), (2, 'v1.0', '1X2', '2', 0.31),
    (3, 'v1.0', '1X2', '1', 0.52), (3, 'v1.0', '1X2', 'X', 0.26), (3, 'v1.0', '1X2', '2', 0.22),
    (4, 'v1.0', '1X2', '1', 0.41), (4, 'v1.0', '1X2', 'X', 0.29), (4, 'v1.0', '1X2', '2', 0.30),
    (5, 'v1.0', '1X2', '1', 0.48), (5, 'v1.0', '1X2', 'X', 0.27), (5, 'v1.0', '1X2', '2', 0.25),
    (6, 'v1.0', 'Spread', 'Home +5.5', 0.51), (6, 'v1.0', 'Spread', 'Away -5.5', 0.49)
  `);

  console.log("[database] Sample data inserted successfully");
}
