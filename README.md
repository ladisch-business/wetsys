# Kurzstart

1) Voraussetzung: Docker & Docker Compose installiert.
2) In dieses Verzeichnis wechseln.
3) `docker compose up -d`
4) Frontend: http://localhost:5173 , Backend: http://localhost:8080

Standard-DB:
  POSTGRES_USER=app
  POSTGRES_PASSWORD=app
  POSTGRES_DB=app

## System Overview

Wett-Prognose MVP - Sports betting prediction webapp with:
- **Frontend**: React + Vite + TypeScript (Port 5173)
- **Backend**: Node.js + Express + TypeScript (Port 8080)
- **Database**: PostgreSQL 16 (Port 5432)

## API Endpoints

- `GET /api/health` - System health check
- `GET /api/leagues` - List supported leagues
- `GET /api/fixtures?leagueId=&from=&to=` - Get fixtures
- `GET /api/predictions/:fixtureId` - Get predictions for fixture
- `POST /api/admin/retrain` - Retrain models (placeholder)
- `POST /api/admin/recalibrate` - Recalibrate models (placeholder)

## Database Schema

- `leagues` - Sports leagues (id, name, sport, country)
- `seasons` - League seasons (id, league_id, year, dates)
- `teams` - Teams (id, league_id, name)
- `fixtures` - Matches (id, league_id, season_id, date, teams, scores)
- `elo_snapshots` - Team ELO ratings over time
- `features` - Match features (JSONB)
- `predictions` - Model predictions (fixture_id, model, market, probability)
- `calibration` - Model calibration data

## Development

```bash
# Backend development
cd backend
npm install
npm run dev

# Frontend development
cd frontend
npm install
npm run dev
```

## Next Steps

According to lastenheft.txt:
- Implement Poisson model for football predictions
- Implement MoV-ELO model for basketball predictions
- Add API-Football/Basketball data integration
- Implement model training and calibration
- Add backtesting functionality
- Implement scheduled data pipelines
