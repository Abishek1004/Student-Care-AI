import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Info, 
  TrendingUp, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Moon,
  Target,
  Users,
  Compass,
  Loader2
} from 'lucide-react';
import LoadingDots from '../components/LoadingDots';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import reportService from '../api/reportService';
import './WellnessScore.css';

const WellnessScore = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const response = await reportService.getHistory(user.userId);
        if (response.success) {
          setHistory(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="wellness-score-page empty-state">
        <div className="empty-content" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Activity size={64} color="#e91e63" />
          <h1>Unlock Your Analytics</h1>
          <p>Please login to see your mental health trends and dimensional breakdown.</p>
          <button className="btn-primary-alt" onClick={() => openLoginModal()} style={{ marginTop: '20px' }}>
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wellness-score-page loading-state">
        <LoadingDots message="Loading your wellness profile..." />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="wellness-score-page empty-state">
        <div className="empty-content" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Compass size={64} color="#6366f1" />
          <h1>No Data Points Found</h1>
          <p>Complete at least one health assessment to generate your wellness profile.</p>
          <button className="btn-primary-alt" onClick={() => navigate('/advice')} style={{ marginTop: '20px' }}>
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const latest = history[0];
  
  // Format data for radar chart (Spider chart)
  const scoreData = [
    { subject: 'Stress', A: latest.academicStress * 20, fullMark: 100, icon: <AlertTriangle size={18} />, desc: 'Indicators of cortisol levels and perceived pressure.' },
    { subject: 'Sleep', A: (latest.sleepHours / 12) * 100, fullMark: 100, icon: <Moon size={18} />, desc: 'Quality and duration of rest.' },
    { subject: 'Focus', A: latest.concentrationProblem * 20, fullMark: 100, icon: <Target size={18} />, desc: 'Ability to maintain concentration and cognitive efficiency.' },
    { subject: 'Social', A: latest.socialSupport * 20, fullMark: 100, icon: <Users size={18} />, desc: 'Quality of interpersonal connections and support.' },
    { subject: 'Emotion', A: latest.feelsHopeless * 20, fullMark: 100, icon: <Compass size={18} />, desc: 'Emotional stability and outlook.' },
  ];

  // Trend data for area chart (max 7 points)
  const trendData = [...history].reverse().slice(-7).map(item => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: 100 - item.score // Convert distress score to wellness score
  }));

  const getStatusColor = (score) => {
    if (score >= 75) return 'green';
    if (score >= 45) return 'yellow';
    return 'red';
  };

  const renderTooltip = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="label">{`${payload[0].payload.subject}: ${Math.round(payload[0].value)}%`}</p>
          <p className="desc">{payload[0].payload.desc}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wellness-score-page">
      <div className="wellness-header">
        <div className="header-content">
          <h1>Detailed Wellness Analytics</h1>
          <p>A deep dive into your mental health metrics and lifestyle patterns.</p>
        </div>
        <button className="improve-btn" onClick={() => navigate('/tools')}>
          Improve Now <ArrowRight size={18} />
        </button>
      </div>

      <div className="wellness-grid">
        {/* Radar Chart Section */}
        <div className="card radar-card">
          <div className="card-header">
            <h3><Activity size={20} /> Mental Health Spider Chart</h3>
            <div className="info-icon" title="Represents a multi-dimensional view of your wellbeing">
              <Info size={16} />
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false} 
                />
                <RechartsTooltip content={renderTooltip} />
                <Radar
                   name="Score"
                   dataKey="A"
                   stroke="#6366f1"
                   strokeWidth={3}
                   fill="#6366f1"
                   fillOpacity={0.4}
                   animationBegin={0}
                   animationDuration={1500}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card trend-card">
          <div className="card-header">
            <h3><TrendingUp size={20} /> Wellness Score Trend</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="details-column">
          <div className="card insights-card">
            <div className="card-header">
              <h3><TrendingUp size={20} /> Insights & Recovery</h3>
            </div>
            <div className="insights-content">
              <div className="insight-summary">
                <div className={`status-indicator ${getStatusColor(100 - latest.score)}`}></div>
                <p>
                   {latest.riskLevel === 'Low' ? 
                    "You are doing great! Keep up your healthy routines and stay positive." :
                    "Some areas of your mental wellness need attention to improve your overall balance."
                   }
                </p>
              </div>
              <div className="analysis-text">
                {latest.suggestions && latest.suggestions[0] ? latest.suggestions[0] : "Based on your recent data, consider a digital detox before bed to improve your sleep quality."}
              </div>
            </div>
          </div>

          <div className="card metrics-card">
            <div className="card-header">
              <h3>Category Breakdown</h3>
            </div>
            <div className="metrics-list">
              {scoreData.map((item, index) => (
                <div 
                  key={index} 
                  className="metric-item"
                  onMouseEnter={() => setHoveredCategory(item.subject)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="metric-info">
                    <div className="metric-label">
                      <span className={`icon-box ${getStatusColor(item.A)}`}>
                        {item.icon}
                      </span>
                      <span>{item.subject}</span>
                    </div>
                    <span className={`metric-value ${getStatusColor(item.A)}`}>
                      {Math.round(item.A)}%
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div 
                      className={`progress-fill ${getStatusColor(item.A)}`}
                      style={{ width: `${item.A}%` }}
                    ></div>
                  </div>
                  {hoveredCategory === item.subject && (
                    <div className="metric-tooltip">
                      {item.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessScore;
