import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  Leaf,
  Brain,
  BookOpen,
  PieChart as PieIcon,
  Download,
  RotateCcw,
  Zap,
  Coffee,
  MessageCircle,
  Dumbbell,
  Info,
  Loader2,
  Activity
} from 'lucide-react';
import LoadingDots from '../components/LoadingDots';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart as GaugeChart,
  Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import reportService from '../api/reportService';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  
  const [data, setData] = useState(location.state?.submissonResult || null);
  const [loading, setLoading] = useState(!location.state?.submissonResult);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLatest = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      if (data) {
        setLoading(false);
        return;
      }

      try {
        const response = await reportService.getHistory(user.userId);
        if (response.success && response.data.length > 0) {
          setData(response.data[0]); // Latest test
        } else {
          setError(response.message || "No assessment history found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [isAuthenticated, user, data]);

  const getRiskColor = (level) => {
    if (!level) return '#94a3b8';
    const lowLevel = level.toLowerCase();
    if (lowLevel === 'low') return '#10b981';
    if (lowLevel === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page empty-state">
        <div className="empty-content">
          <Brain size={64} color="#e91e63" />
          <h1>Welcome to Student Care AI</h1>
          <p>Please login to view your mental health analytics and personalized suggestions.</p>
          <button className="btn-primary-alt" onClick={() => openLoginModal()}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page loading-state">
        <LoadingDots message="Analyzing your health data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-page empty-state">
        <div className="empty-content">
          <ClipboardCheck size={64} color="#e91e63" />
          <h1>No Data Yet</h1>
          <p>Take your first mental health assessment to unlock your personalized dashboard.</p>
          <button className="btn-primary-alt" onClick={() => navigate('/advice')}>
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  // Format metrics for the bar chart
  // Mapping API names to display names
  const metrics = [
    { name: 'Stress', score: data.academicStress * 20, color: '#f87171' },
    { name: 'Support', score: data.socialSupport * 20, color: '#60a5fa' },
    { name: 'Focus', score: data.concentrationProblem * 20, color: '#fbbf24' },
    { name: 'Emotion', score: data.feelsHopeless * 20, color: '#a78bfa' },
    { name: 'Sleep', score: (data.sleepHours / 12) * 100, color: '#34d399' },
  ];

  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'Recently';

  const fullDateStr = data.createdAt ? new Date(data.createdAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Just now';

  return (
    <div className="dashboard-page">
      <div className="dashboard-container-full">

        <header className="dash-header">
          <div className="header-left">
            <h1>Health Intelligence Dashboard</h1>
            <p>Based on your latest analyzer submission from {dateStr}</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon-alt" onClick={() => navigate('/wellness-score')}>
              <PieIcon size={18} /> Analytics
            </button>
            <button className="btn-icon-alt" onClick={() => window.print()}>
              <Download size={18} /> Download
            </button>
            <button className="btn-primary-alt" onClick={() => navigate('/advice')}>
              <RotateCcw size={18} /> Retake
            </button>
          </div>
        </header>

        {/* Top Summary Cards */}
        <section className="top-stats-grid">
          <div className="stat-card risk-card">
            <div className="stat-info">
              <span className="stat-label">Risk Level</span>
              <div className="risk-badge" style={{ backgroundColor: getRiskColor(data.riskLevel) + '20', color: getRiskColor(data.riskLevel) }}>
                {data.riskLevel} Risk
              </div>
            </div>
            <AlertCircle size={32} color={getRiskColor(data.riskLevel)} />
          </div>

          <div className="stat-card score-circular-card">
            <div className="stat-info">
              <span className="stat-label">Overall Wellness Score</span>
              <div className="score-display">
                <span className="score-num">{data.score}</span>
                <span className="score-total">/100</span>
              </div>
            </div>
            <div className="circular-progress">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${data.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>

          <div className="stat-card time-stat-card">
            <div className="stat-info">
              <span className="stat-label">User Profile</span>
              <div className="time-val">{user?.name}</div>
              <span className="time-unit">{data.age} Yrs • {data.gender}</span>
            </div>
            <Activity size={32} color="#6366f1" />
          </div>
        </section>

        <div className="main-content-grid">
          {/* Main Chart Section */}
          <section className="chart-section-wrapper">
            <div className="section-title">
              <h3><TrendingUp size={20} /> Analysis Breakdown</h3>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={metrics} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                    {metrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Gauge Card */}
            <div className="wellness-gauge-card mt-8">
              <div className="gauge-header">
                <div className="gauge-time">
                  <Clock size={16} /> {fullDateStr}
                </div>
              </div>

              <div className="gauge-body">
                <div className="gauge-viz-container">
                  <ResponsiveContainer width={240} height={140}>
                    <GaugeChart>
                      <Pie
                        data={[
                          { value: 33, fill: '#ef4444' }, // Low Wellness (High Score) -> Red
                          { value: 33, fill: '#f59e0b' }, // Mid
                          { value: 34, fill: '#10b981' }  // High Wellness (Low Score) -> Green
                        ]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      />
                    </GaugeChart>
                  </ResponsiveContainer>
                  {/* Needle for gauge - Inverse logic: high score = high distress = left side (red) */}
                  {/* Here Score is 0-100 where 100 is bad mental health. So gauge should reflect that. */}
                  {/* But the gauge shown in mock was Wellness Score. If Wellness Score = 100 - distressedScore */}
                  <div className="gauge-needle" style={{ transform: `rotate(${((100 - data.score) / 100) * 180 - 90}deg)` }}></div>
                </div>

                <div className="gauge-details">
                  <div className="gauge-title">
                    Wellness Score <Info size={16} color="#94a3b8" />
                  </div>
                  <div className="gauge-score-row">
                    <div className="gauge-score-value">
                      <span className="score-main">{Math.round((100 - data.score) / 10)}</span>
                      <span className="score-sub">/10</span>
                    </div>
                    <div className={`gauge-status-badge ${data.riskLevel.toLowerCase()}-badge`}>
                      <span className="emoji-circle">{data.riskLevel === 'Low' ? '😍' : data.riskLevel === 'Medium' ? '😐' : '😰'}</span>
                      <span className="status-label">{data.riskLevel === 'Low' ? 'High Wellness' : data.riskLevel === 'Medium' ? 'Moderate' : 'Risk Alert'}</span>
                    </div>
                  </div>
                  <p className="gauge-disclaimer">
                    This analysis is based on your self-reported indicators and built-in scoring.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Suggestions Panel */}
          <aside className="suggestions-aside">
            <div className="section-title">
              <h3><Leaf size={20} /> Suggestions</h3>
            </div>
            <div className="suggestions-vertical-list">
              {data.suggestions && data.suggestions.length > 0 ? (
                data.suggestions.map((text, idx) => (
                  <label className={`suggest-card-flat color-blue`} key={idx} style={{ cursor: 'pointer' }}>
                    <div className="suggest-icon-ring"><Zap size={18} /></div>
                    <div className="suggest-content" style={{ flex: 1 }}>
                      <h4>Recommendation {idx + 1}</h4>
                      <p>{text}</p>
                    </div>
                    <div className="custom-checkbox-wrapper">
                      <input type="checkbox" className="custom-checkbox-input" />
                      <div className="custom-checkbox-display">
                        <svg className="custom-checkbox-icon" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="no-suggestions">No specific suggestions generated. Continue maintaining a balanced lifestyle!</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;