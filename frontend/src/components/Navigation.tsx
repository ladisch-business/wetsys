import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "System Status" },
    { path: "/leagues", label: "Liga Dashboard" },
    { path: "/backtest", label: "Backtest" },
    { path: "/admin", label: "Admin" }
  ];

  return (
    <nav style={{ 
      padding: "16px 24px", 
      borderBottom: "1px solid #ddd", 
      backgroundColor: "#f8f9fa" 
    }}>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
          Wett-Prognose MVP
        </h1>
        <div style={{ display: "flex", gap: "16px" }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: location.pathname === item.path ? "#007bff" : "transparent",
                color: location.pathname === item.path ? "white" : "#333",
                fontWeight: location.pathname === item.path ? "500" : "normal"
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
