import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import SystemStatus from "./pages/SystemStatus";
import LeagueDashboard from "./pages/LeagueDashboard";
import FixtureDetail from "./pages/FixtureDetail";
import BacktestDashboard from "./pages/BacktestDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: "ui-sans-serif, system-ui", minHeight: "100vh" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<SystemStatus />} />
          <Route path="/leagues" element={<LeagueDashboard />} />
          <Route path="/fixture/:fixtureId" element={<FixtureDetail />} />
          <Route path="/backtest" element={<BacktestDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
