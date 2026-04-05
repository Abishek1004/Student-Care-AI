import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  ExternalLink,
  PlusCircle,
  Inbox,
  TrendingUp,
  Share2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [filterTime, setFilterTime] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for test history
  const [historyData, setHistoryData] = useState([
    { id: 1, date: 'Apr 3, 2026', score: 72, riskLevel: 'Medium', timeTaken: '6:45 min', trend: 'up' },
    { id: 2, date: 'Mar 28, 2026', score: 85, riskLevel: 'Low', timeTaken: '5:20 min', trend: 'up' },
    { id: 3, date: 'Mar 15, 2026', score: 45, riskLevel: 'High', timeTaken: '8:10 min', trend: 'down' },
    { id: 4, date: 'Feb 22, 2026', score: 68, riskLevel: 'Medium', timeTaken: '7:05 min', trend: 'up' },
    { id: 5, date: 'Feb 05, 2026', score: 92, riskLevel: 'Low', timeTaken: '4:45 min', trend: 'up' },
  ]);

  const trendChartData = [
    { name: 'Feb 05', score: 92 },
    { name: 'Feb 22', score: 68 },
    { name: 'Mar 15', score: 45 },
    { name: 'Mar 28', score: 85 },
    { name: 'Apr 03', score: 72 },
  ];

  const getRiskBadgeClass = (level) => {
    if (level === 'Low') return 'badge-low';
    if (level === 'Medium') return 'badge-medium';
    return 'badge-high';
  };

  const handleDownload = (id) => {
    console.log(`Downloading report ${id} as PDF...`);
    alert(`Report #${id} download started as PDF.`);
  };

  const filteredHistory = historyData.filter(item => 
    item.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.riskLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="reports-page">
      <div className="reports-container">
        {/* Header Section */}
        <header className="reports-header">
          <div className="title-area">
            <h1>Reports</h1>
            <p>View and download your past mental health test results</p>
          </div>
          <button className="export-btn">
            <Share2 size={18} /> Export All Reports
          </button>
        </header>

        {/* Trend Summary Section */}
        {historyData.length > 0 && (
          <div className="card trend-card">
            <div className="card-title">
              <h3><TrendingUp size={20} color="#ff6b9a" /> Score Trend Over Time</h3>
            </div>
            <div className="trend-viz">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b9a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ff6b9a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ff6b9a" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters Top Bar */}
        <div className="filters-bar">
          <div className="filter-left">
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by date or risk..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="dropdown-wrap">
              <Filter size={18} />
              <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)}>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="card table-card">
          {filteredHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Risk Level</th>
                    <th>Time Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((row) => (
                    <tr key={row.id}>
                      <td className="date-cell">
                        <Calendar size={16} color="#ff6b9a" /> {row.date}
                      </td>
                      <td className="score-cell">
                        <div className="score-wrap">
                          <span className="score-val">{row.score}/100</span>
                          {row.trend === 'up' ? (
                            <ArrowUpRight size={14} color="#10b981" />
                          ) : (
                            <ArrowDownRight size={14} color="#ef4444" />
                          )}
                        </div>
                      </td>
                      <td className="risk-cell">
                        <span className={`risk-badge ${getRiskBadgeClass(row.riskLevel)}`}>
                          {row.riskLevel} Risk
                        </span>
                      </td>
                      <td className="time-cell">{row.timeTaken}</td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button className="btn-view" onClick={() => navigate('/wellness-score')} title="View Details">
                            <Eye size={18} />
                          </button>
                          <button className="btn-download" onClick={() => handleDownload(row.id)} title="Download PDF">
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Inbox size={64} color="#e2e8f0" />
              <h3>No reports available yet</h3>
              <p>You haven't taken any health analyzer tests yet. Take your first test to see your results here.</p>
              <button className="btn-start" onClick={() => navigate('/advice')}>
                <PlusCircle size={20} /> Take Your First Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
