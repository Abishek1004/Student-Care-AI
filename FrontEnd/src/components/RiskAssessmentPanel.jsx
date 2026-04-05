import { useState, useEffect, useRef } from "react";
import "./RiskAssessmentPanel.css";

const RISK_CONFIG = {
  low: {
    label: "Low Risk",
    emoji: "✅",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    badgeClass: "badge-low",
    ringColor: "#22c55e",
    suggestions: [
      { icon: "🥗", text: "Maintain your healthy diet and lifestyle" },
      { icon: "🏃", text: "Keep up with regular physical activity" },
      { icon: "😴", text: "Ensure 7–8 hours of quality sleep" },
      { icon: "💧", text: "Stay well-hydrated throughout the day" },
    ],
  },
  medium: {
    label: "Moderate Risk",
    emoji: "⚠️",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    badgeClass: "badge-medium",
    ringColor: "#f59e0b",
    suggestions: [
      { icon: "🏋️", text: "Exercise regularly — aim for 150 min/week" },
      { icon: "🥦", text: "Improve your diet: reduce processed foods" },
      { icon: "🩺", text: "Schedule a routine health check-up" },
      { icon: "🧘", text: "Manage stress with mindfulness or yoga" },
    ],
  },
  high: {
    label: "High Risk",
    emoji: "🚨",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    badgeClass: "badge-high",
    ringColor: "#ef4444",
    suggestions: [
      { icon: "👨‍⚕️", text: "Consult a doctor immediately" },
      { icon: "❤️", text: "Monitor blood pressure and heart rate daily" },
      { icon: "🚫", text: "Avoid smoking, alcohol, and junk food" },
      { icon: "📋", text: "Follow a structured treatment plan" },
    ],
  },
};

function getRiskLevel(score) {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

// Circular SVG progress ring
function CircularProgress({ score, color }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg className="circular-ring" viewBox="0 0 180 180" width="180" height="180">
      {/* Track */}
      <circle
        cx="90" cy="90" r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="14"
      />
      {/* Progress */}
      <circle
        cx="90" cy="90" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 6px ${color}88)`,
        }}
      />
      <text x="90" y="85" textAnchor="middle" fontSize="30" fontWeight="700" fill={color}>
        {score}%
      </text>
      <text x="90" y="108" textAnchor="middle" fontSize="13" fill="#9ca3af">
        Risk Score
      </text>
    </svg>
  );
}

export default function RiskAssessmentPanel({ riskScore: propScore = null }) {
  // Demo: use propScore if provided, else default to 72
  const [riskScore, setRiskScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);
  const animRef = useRef(null);
  const targetScore = propScore !== null ? propScore : 72;

  const riskLevel = getRiskLevel(riskScore);
  const config = RISK_CONFIG[riskLevel];

  // Count-up animation
  useEffect(() => {
    setVisible(false);
    setDisplayScore(0);
    setRiskScore(0);

    const delay = setTimeout(() => {
      setVisible(true);
      let start = 0;
      const duration = 1200;
      const step = 16;
      const increment = (targetScore / duration) * step;

      animRef.current = setInterval(() => {
        start += increment;
        if (start >= targetScore) {
          start = targetScore;
          clearInterval(animRef.current);
        }
        setDisplayScore(Math.round(start));
        setRiskScore(Math.round(start));
      }, step);
    }, 200);

    return () => {
      clearTimeout(delay);
      clearInterval(animRef.current);
    };
  }, [targetScore]);

  const handleRecheck = () => {
    setRiskScore(0);
    setDisplayScore(0);
    setVisible(false);

    // Simulate a new score (random demo)
    const newScore = Math.floor(Math.random() * 100);
    setTimeout(() => {
      setVisible(true);
      let start = 0;
      const duration = 1200;
      const step = 16;
      const increment = (newScore / duration) * step;

      animRef.current = setInterval(() => {
        start += increment;
        if (start >= newScore) {
          start = newScore;
          clearInterval(animRef.current);
        }
        setDisplayScore(Math.round(start));
        setRiskScore(Math.round(start));
      }, step);
    }, 300);
  };

  return (
    <div className="risk-panel">
      <div className="risk-panel-header">
        <h2>🩺 Risk Assessment Result</h2>
        <p className="risk-subtitle">Based on your latest health data</p>
      </div>

      <div className="risk-main-layout">
        {/* Left: Score + Badge */}
        <div className="risk-score-card">
          <div className="ring-wrapper">
            <CircularProgress score={displayScore} color={config.ringColor} />
          </div>

          <span className={`risk-badge ${config.badgeClass}`}>
            {config.emoji} {config.label}
          </span>

          {/* Mini progress bar */}
          <div className="mini-bar-track">
            <div
              className="mini-bar-fill"
              style={{
                width: `${displayScore}%`,
                background: `linear-gradient(90deg, ${config.ringColor}88, ${config.ringColor})`,
              }}
            />
          </div>
          <div className="mini-bar-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>

          <button className="recheck-btn" onClick={handleRecheck}>
            🔄 Take Assessment Again
          </button>
        </div>

        {/* Right: Suggestions */}
        <div
          className={`suggestions-card ${visible ? "suggestions-visible" : ""}`}
          style={{ background: config.bg, borderColor: config.border }}
        >
          <h3 style={{ color: config.color }}>
            💡 Recommendations for You
          </h3>
          <ul className="suggestions-list">
            {config.suggestions.map((s, i) => (
              <li
                key={i}
                className={`suggestion-item ${visible ? "suggestion-item-visible" : ""}`}
                style={{ animationDelay: `${0.3 + i * 0.12}s` }}
              >
                <span className="suggestion-icon">{s.icon}</span>
                <span className="suggestion-text">{s.text}</span>
              </li>
            ))}
          </ul>

          <div className="risk-legend">
            <span className="legend-dot dot-low" /> Low &lt;40%
            <span className="legend-dot dot-mid" /> Medium 40–69%
            <span className="legend-dot dot-high" /> High ≥70%
          </div>
        </div>
      </div>
    </div>
  );
}
