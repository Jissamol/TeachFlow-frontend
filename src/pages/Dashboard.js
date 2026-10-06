import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  AreaChart, Area, Legend
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({
    academic_year: "All",
    appraisal_period: {
      id: 1,
      title: "Annual Appraisal",
      status: "Draft",
      target_score: 300.0,
      period_start: "2025-06-01",
      period_end: "2026-05-31",
    },
    annual_target: 300.0,
    total_score: 0,
    target_percentage: 0,
    category_scores: {
      teaching: { score: 0, count: 0 },
      student_support: { score: 0, count: 0 },
      research: { score: 0, count: 0 },
      academic_contributions: { score: 0, count: 0 },
      institutional_responsibilities: { score: 0, count: 0 },
    },
    evidence_health: {
      total_entries: 0,
      entries_with_evidence: 0,
      evidence_percentage: 100,
      total_evidence_files: 0,
      category_breakdown: {
        teaching: { verified: 0, missing: 0 },
        student_support: { verified: 0, missing: 0 },
        research: { verified: 0, missing: 0 },
        academic: { verified: 0, missing: 0 },
        institutional: { verified: 0, missing: 0 },
      }
    },
    scoring_rules: []
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    fetchSummary(selectedYear);
    fetchNotifications();
  }, [selectedYear]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/notifications/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {}
  };

  const fetchSummary = async (year) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/summary/?academic_year=${year}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch PBAS summary", err);
    }
  };

  const updateAppraisalStatus = async (newStatus) => {
    const token = localStorage.getItem("access_token");
    if (!summary.appraisal_period?.id) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/appraisal-period/${summary.appraisal_period.id}/`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchSummary(selectedYear);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chart 1: PBAS Multi-Year Score Trajectory
  const trendData = [
    { year: '2023–24', Score: 180, Target: 300 },
    { year: '2024–25', Score: 240, Target: 300 },
    { year: '2025–26', Score: summary.total_score || 285, Target: 300 },
  ];

  // Chart 2: Category Score Breakdown vs Target
  const categoryBarData = [
    { name: 'Teaching', Earned: summary.category_scores.teaching.score, Target: 100 },
    { name: 'Support', Earned: summary.category_scores.student_support.score, Target: 50 },
    { name: 'Research', Earned: summary.category_scores.research.score, Target: 120 },
    { name: 'Academic', Earned: summary.category_scores.academic_contributions.score, Target: 50 },
    { name: 'Institutional', Earned: summary.category_scores.institutional_responsibilities.score, Target: 60 },
  ];

  // Chart 3: Category Contribution Weightage (Donut Chart)
  const donutColors = ['#1a4d2e', '#2d6a4f', '#40916c', '#52b788', '#74c69d'];
  const categoryDonutData = [
    { name: 'Teaching & Learning', value: summary.category_scores.teaching.score || 10 },
    { name: 'Student Support', value: summary.category_scores.student_support.score || 10 },
    { name: 'Research & Pubs', value: summary.category_scores.research.score || 10 },
    { name: 'Academic Contributions', value: summary.category_scores.academic_contributions.score || 10 },
    { name: 'Institutional Service', value: summary.category_scores.institutional_responsibilities.score || 10 },
  ].filter(d => d.value > 0);

  // Chart 4: Evidence Completeness by Category (Stacked BarChart)
  const cb = summary.evidence_health.category_breakdown || {};
  const evidenceStackedData = [
    { category: 'Teaching', Verified: cb.teaching?.verified || 2, Missing: cb.teaching?.missing || 1 },
    { category: 'Support', Verified: cb.student_support?.verified || 2, Missing: cb.student_support?.missing || 1 },
    { category: 'Research', Verified: cb.research?.verified || 1, Missing: cb.research?.missing || 2 },
    { category: 'Academic', Verified: cb.academic?.verified || 1, Missing: cb.academic?.missing || 1 },
    { category: 'Institutional', Verified: cb.institutional?.verified || 1, Missing: cb.institutional?.missing || 1 },
  ];

  // Chart 5: Competency Balance Radar
  const radarData = [
    { subject: 'Teaching', Earned: summary.category_scores.teaching.score, Benchmark: 100 },
    { subject: 'Support', Earned: summary.category_scores.student_support.score, Benchmark: 50 },
    { subject: 'Research', Earned: summary.category_scores.research.score, Benchmark: 120 },
    { subject: 'Academic', Earned: summary.category_scores.academic_contributions.score, Benchmark: 50 },
    { subject: 'Institutional', Earned: summary.category_scores.institutional_responsibilities.score, Benchmark: 60 },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'Submitted': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      case 'Under Review': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const statusStyle = getStatusStyle(summary.appraisal_period?.status);

  return (
    <>
      <style>{`
        .dashboard-container { 
          background: #faf8f5; 
          min-height: 100vh; 
          padding: 40px 32px; 
          font-family: 'Outfit', sans-serif; 
          color: #0f172a; 
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.1rem;
          font-weight: 800;
          color: #1a4d2e;
          margin: 0;
        }

        .page-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 4px;
        }

        .year-select {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1a4d2e;
          font-weight: 700;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
        }

        /* Top Key Metrics Row */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .metric-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 2.1rem;
          font-weight: 800;
          color: #1a4d2e;
          font-family: 'Playfair Display', serif;
          line-height: 1;
        }

        .metric-sub {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 8px;
          font-weight: 600;
        }

        /* Appraisal Control Banner */
        .appraisal-banner {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 22px 28px;
          margin-bottom: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .status-badge {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-action {
          background: #1a4d2e;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btn-action:hover { background: #123620; }

        .btn-secondary {
          background: #ffffff;
          color: #1a4d2e;
          border: 1px solid #1a4d2e;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btn-secondary:hover { background: #f0fdf4; }

        /* Notifications Alert Bar */
        .notif-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 28px;
        }

        .notif-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        .notif-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .notif-card:hover { border-color: #1a4d2e; }

        /* Charts Layout Grid */
        .charts-row-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        .charts-row-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        .chart-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Detailed Score Table */
        .table-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          margin-bottom: 28px;
        }

        .score-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 14px;
        }

        .score-table th {
          text-align: left;
          font-size: 0.78rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 16px;
          border-bottom: 2px solid #e2e8f0;
          background: #faf8f5;
        }

        .score-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
          color: #1e293b;
        }

        .score-table tr:hover { background: #f8fafc; cursor: pointer; }

        @media (max-width: 1024px) {
          .charts-row-two, .charts-row-three { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Page Header */}
        <div className="header-section">
          <div>
            <h1 className="page-title">Academic Appraisal Dashboard</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Academic Year:</span>
            <select className="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="All">All Academic Years</option>
              <option value="2025-2026">2025–2026</option>
              <option value="2024-2025">2024–2025</option>
              <option value="2023-2024">2023–2024</option>
            </select>
          </div>
        </div>

        {/* Top Key Metric Cards Row */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Total PBAS Score</div>
            <div className="metric-value">{summary.total_score} <span style={{ fontSize: '1rem', color: '#64748b' }}>pts</span></div>
            <div className="metric-sub">Calculated via System Scoring Rules</div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Annual Target Progress</div>
            <div className="metric-value">{summary.target_percentage}%</div>
            <div className="metric-sub">{summary.total_score} / {summary.annual_target} Target Points</div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Evidence Completeness</div>
            <div className="metric-value" style={{ color: summary.evidence_health.evidence_percentage >= 80 ? '#166534' : '#b45309' }}>
              {summary.evidence_health.evidence_percentage}%
            </div>
            <div className="metric-sub">{summary.evidence_health.entries_with_evidence} / {summary.evidence_health.total_entries} Activities Documented</div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Repository Vault</div>
            <div className="metric-value">{summary.evidence_health.total_evidence_files || 0}</div>
            <div className="metric-sub">Uploaded Certificates & Proofs</div>
          </div>
        </div>

        {/* Appraisal Period Control Banner */}
        <div className="appraisal-banner">
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a4d2e' }}>
                {summary.appraisal_period?.title || `${selectedYear} Annual Appraisal`}
              </span>
              <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                Status: {summary.appraisal_period?.status || 'Draft'}
              </span>
            </div>
            
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {summary.appraisal_period?.status === 'Draft' && (
              <button className="btn-action" onClick={() => updateAppraisalStatus('Submitted')}>
                Submit Appraisal Report
              </button>
            )}
            {summary.appraisal_period?.status === 'Submitted' && (
              <button className="btn-action" onClick={() => updateAppraisalStatus('Under Review')}>
                Send for Review
              </button>
            )}
            {summary.appraisal_period?.status === 'Under Review' && (
              <button className="btn-action" onClick={() => updateAppraisalStatus('Completed')}>
                Mark as Completed
              </button>
            )}
            {summary.appraisal_period?.status === 'Completed' && (
              <button className="btn-secondary" onClick={() => updateAppraisalStatus('Draft')}>
                Re-open Draft
              </button>
            )}
            <button className="btn-secondary" onClick={() => navigate('/pbas/report')}>
              Generate PDF Dossier
            </button>
          </div>
        </div>

        
        {/* CHARTS ROW 1: Multi-Year Trajectory & Category Breakdown */}
        <div className="charts-row-two">
          {/* Chart 1: Area Chart Multi-Year Trend */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title">PBAS Score Multi-Year Trajectory</div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Annual Score vs 300 Target</span>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="Score" stroke="#1a4d2e" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                  <Area type="monotone" dataKey="Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Score Breakdown Bar Chart */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title">Points Earned by PBAS Category</div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Category Points Breakdown</span>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                  <Bar dataKey="Earned" fill="#1a4d2e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: Donut Distribution, Stacked Evidence & Radar Balance */}
        <div className="charts-row-three">
          {/* Chart 3: Donut Contribution Breakdown */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title">Category Weightage Distribution</div>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryDonutData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Evidence Completeness Stacked Bar Chart */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title">Document Verification Status</div>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={evidenceStackedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <Bar dataKey="Verified" stackId="a" fill="#166534" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Missing" stackId="a" fill="#fde68a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Competency Radar Chart */}
          <div className="chart-box">
            <div className="chart-header">
              <div className="chart-title">Academic Competency Balance</div>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Radar name="Earned Points" dataKey="Earned" stroke="#1a4d2e" fill="#1a4d2e" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Category Score Summary Table */}
        <div className="table-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="chart-title">PBAS Performance Summary Table</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>Detailed breakdowns per appraisal category</div>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/pbas/rules')}>
              View Scoring Rules Engine
            </button>
          </div>

          <table className="score-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Activities Logged</th>
                <th>Earned Points</th>
                <th>Verification Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => navigate('/pbas/teaching')}>
                <td><strong>Teaching & Learning</strong></td>
                <td>{summary.category_scores.teaching.count} Courses</td>
                <td><strong>{summary.category_scores.teaching.score} pts</strong></td>
                <td><span style={{ color: '#166534', fontWeight: 700 }}>Verified</span></td>
                <td style={{ color: '#1a4d2e', fontWeight: 700 }}>Manage Entries →</td>
              </tr>
              <tr onClick={() => navigate('/pbas/student-support')}>
                <td><strong>Student Support & Mentorship</strong></td>
                <td>{summary.category_scores.student_support.count} Activities</td>
                <td><strong>{summary.category_scores.student_support.score} pts</strong></td>
                <td><span style={{ color: '#166534', fontWeight: 700 }}>Verified</span></td>
                <td style={{ color: '#1a4d2e', fontWeight: 700 }}>Manage Entries →</td>
              </tr>
              <tr onClick={() => navigate('/pbas/research')}>
                <td><strong>Research & Publications</strong></td>
                <td>{summary.category_scores.research.count} Publications</td>
                <td><strong>{summary.category_scores.research.score} pts</strong></td>
                <td><span style={{ color: '#166534', fontWeight: 700 }}>Verified</span></td>
                <td style={{ color: '#1a4d2e', fontWeight: 700 }}>Manage Entries →</td>
              </tr>
              <tr onClick={() => navigate('/pbas/academic')}>
                <td><strong>Academic Contributions</strong></td>
                <td>{summary.category_scores.academic_contributions.count} Contributions</td>
                <td><strong>{summary.category_scores.academic_contributions.score} pts</strong></td>
                <td><span style={{ color: '#166534', fontWeight: 700 }}>Verified</span></td>
                <td style={{ color: '#1a4d2e', fontWeight: 700 }}>Manage Entries →</td>
              </tr>
              <tr onClick={() => navigate('/pbas/institutional')}>
                <td><strong>Institutional Responsibilities</strong></td>
                <td>{summary.category_scores.institutional_responsibilities.count} Roles</td>
                <td><strong>{summary.category_scores.institutional_responsibilities.score} pts</strong></td>
                <td><span style={{ color: '#166534', fontWeight: 700 }}>Verified</span></td>
                <td style={{ color: '#1a4d2e', fontWeight: 700 }}>Manage Entries →</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;