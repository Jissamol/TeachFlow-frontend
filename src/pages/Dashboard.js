import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All");
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
      total_evidence_files: 0
    },
    scoring_rules: []
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    fetchSummary(selectedYear);
  }, [selectedYear]);

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

  const radarData = [
    { subject: 'Teaching', Earned: summary.category_scores.teaching.score, Max: 100 },
    { subject: 'Support', Earned: summary.category_scores.student_support.score, Max: 50 },
    { subject: 'Research', Earned: summary.category_scores.research.score, Max: 120 },
    { subject: 'Academic', Earned: summary.category_scores.academic_contributions.score, Max: 50 },
    { subject: 'Institutional', Earned: summary.category_scores.institutional_responsibilities.score, Max: 60 },
  ];

  const categoryBarData = [
    { name: 'Teaching', Score: summary.category_scores.teaching.score },
    { name: 'Support', Score: summary.category_scores.student_support.score },
    { name: 'Research', Score: summary.category_scores.research.score },
    { name: 'Academic', Score: summary.category_scores.academic_contributions.score },
    { name: 'Institutional', Score: summary.category_scores.institutional_responsibilities.score },
  ];

  const pieGaugeData = [
    { name: 'Achieved', value: summary.total_score, fill: '#1a4d2e' },
    { name: 'Remaining', value: Math.max(0, summary.annual_target - summary.total_score), fill: '#e2e8f0' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#dcfce7', text: '#166534' };
      case 'Submitted': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Under Review': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const statusStyle = getStatusColor(summary.appraisal_period?.status);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
        
        .dashboard-container { 
          background: #fdfcfb; 
          min-height: 100vh; 
          padding: 35px; 
          font-family: 'Outfit', sans-serif; 
          color: #0d2c1a; 
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .hero-banner {
          background: linear-gradient(135deg, #0d2c1a 0%, #1a4d2e 60%, #2e6a4f 100%);
          border-radius: 24px;
          padding: 28px 36px;
          color: #ffffff;
          box-shadow: 0 20px 40px rgba(13, 44, 26, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .year-dropdown {
          padding: 10px 20px;
          border-radius: 14px;
          border: 1px solid rgba(26, 77, 46, 0.2);
          background: #ffffff;
          color: #1a4d2e;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          outline: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .appraisal-box {
          background: #ffffff;
          border: 1px solid rgba(26, 77, 46, 0.12);
          border-radius: 20px;
          padding: 24px 28px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-pill {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
        }

        .card { 
          background: #ffffff; 
          border: 1px solid rgba(26, 77, 46, 0.08); 
          border-radius: 20px; 
          padding: 26px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(26, 77, 46, 0.06); }

        .card-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }

        .btn-report {
          background: #22c55e;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-report:hover { background: #16a34a; transform: scale(1.02); }

        .progress-bar-bg {
          height: 14px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 10px;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a4d2e, #22c55e);
          border-radius: 10px;
          transition: width 1s ease;
        }

        .score-list-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: #f8faf9;
          border-radius: 14px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .score-list-row:hover { background: #f0f4f2; }

        .btn-status-action {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #1a4d2e;
          background: #1a4d2e;
          color: #fff;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-status-action:hover { background: #123620; }
      `}</style>

      <div className="dashboard-container">
        {/* HEADER WITH ACADEMIC YEAR SELECTOR */}
        <div className="header-row">
          <div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'Playfair Display', margin: 0, fontWeight: 900, color: '#1a4d2e' }}>
              Academic Appraisal Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Dynamic PBAS Score Engine & Evidence Verification System
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Academic Year:</span>
            <select className="year-dropdown" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="All">All Academic Years</option>
              <option value="2025-2026">2025–2026</option>
              <option value="2024-2025">2024–2025</option>
              <option value="2023-2024">2023–2024</option>
            </select>
          </div>
        </div>

        {/* APPRAISAL PERIOD STATUS BOX */}
        <div className="appraisal-box">
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1a4d2e' }}>
                {summary.appraisal_period?.title || `${selectedYear} Annual Appraisal`}
              </h3>
              <span className="status-pill" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                Status: {summary.appraisal_period?.status || 'Draft'}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Period: <strong>June {selectedYear.split('-')[0]} – May 20{selectedYear.split('-')[1]}</strong> • 
              Total Activities: <strong>{summary.evidence_health.total_entries}</strong> • 
              Evidence: <strong>{summary.evidence_health.entries_with_evidence}/{summary.evidence_health.total_entries} verified by system</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {summary.appraisal_period?.status === 'Draft' && (
              <button className="btn-status-action" onClick={() => updateAppraisalStatus('Submitted')}>
                Submit Appraisal Report
              </button>
            )}
            {summary.appraisal_period?.status === 'Submitted' && (
              <button className="btn-status-action" onClick={() => updateAppraisalStatus('Under Review')}>
                Send for Review
              </button>
            )}
            {summary.appraisal_period?.status === 'Under Review' && (
              <button className="btn-status-action" onClick={() => updateAppraisalStatus('Completed')}>
                Mark as Completed
              </button>
            )}
            {summary.appraisal_period?.status === 'Completed' && (
              <button className="btn-status-action" style={{ background: '#64748b', borderColor: '#64748b' }} onClick={() => updateAppraisalStatus('Draft')}>
                Re-open Draft
              </button>
            )}
            <button className="btn-report" onClick={() => navigate('/pbas/report')}>
              ⚡ Generate PDF Dossier
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="card">
            <div className="card-label">Total PBAS Score</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.total_score} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>pts</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '6px', fontWeight: 700 }}>
              Calculated dynamically via Rules
            </div>
          </div>

          <div className="card">
            <div className="card-label">🎯 Annual Target</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0d2c1a', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.annual_target} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>pts</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${summary.target_percentage}%` }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', marginTop: '6px' }}>
              {summary.target_percentage}% Target Achieved
            </div>
          </div>

          <div className="card">
            <div className="card-label">Evidence Completeness</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: summary.evidence_health.evidence_percentage >= 80 ? '#166534' : '#b45309', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.evidence_health.evidence_percentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              {summary.evidence_health.entries_with_evidence} / {summary.evidence_health.total_entries} Documents Verified
            </div>
          </div>

          <div className="card" onClick={() => navigate('/pbas/rules')} style={{ cursor: 'pointer' }}>
            <div className="card-label">Scoring System</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a4d2e', marginTop: '8px' }}>
              Configurable Rules
            </div>
            <div style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: '6px', fontWeight: 700 }}>
              ⚙️ Customize Points Rules →
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid-layout">
          {/* LEFT: Category PBAS Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="card-label">PBAS Category Score Breakdown</div>
                <button onClick={() => navigate('/pbas/rules')} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '12px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                  ⚙️ Institution Rules Engine
                </button>
              </div>

              <div className="score-list-row" onClick={() => navigate('/pbas/teaching')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Teaching & Learning</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.category_scores.teaching.count} Courses & Teaching Hours Logged</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a4d2e' }}>
                  {summary.category_scores.teaching.score} points
                </div>
              </div>

              <div className="score-list-row" onClick={() => navigate('/pbas/student-support')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Student Support</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.category_scores.student_support.count} Mentoring & Support Activities</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a4d2e' }}>
                  {summary.category_scores.student_support.score} points
                </div>
              </div>

              <div className="score-list-row" onClick={() => navigate('/pbas/research')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Research</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.category_scores.research.count} Journals, Conferences, Patents & Guidance</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a4d2e' }}>
                  {summary.category_scores.research.score} points
                </div>
              </div>

              <div className="score-list-row" onClick={() => navigate('/pbas/academic')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Academic Contribution</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.category_scores.academic_contributions.count} Invited Lectures, Presentations & Awards</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a4d2e' }}>
                  {summary.category_scores.academic_contributions.score} points
                </div>
              </div>

              <div className="score-list-row" onClick={() => navigate('/pbas/institutional')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Institutional Responsibility</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.category_scores.institutional_responsibilities.count} HOD, Committee & Admin Duties</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a4d2e' }}>
                  {summary.category_scores.institutional_responsibilities.score} points
                </div>
              </div>

              <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0d2c1a' }}>Total PBAS Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display' }}>
                  {summary.total_score} points
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-label" style={{ marginBottom: '15px' }}>Points Breakdown Visualizer</div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Score" fill="#1a4d2e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT: Radar & Target Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-label" style={{ marginBottom: '10px' }}>🎯 Annual Target Meter</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieGaugeData} innerRadius={45} outerRadius={65} dataKey="value" startAngle={180} endAngle={0} stroke="none">
                    <Cell fill="#1a4d2e" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '-40px' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display' }}>
                  {summary.target_percentage}%
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                  {summary.total_score} / {summary.annual_target} Points
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-label">Appraisal Radar</div>
              <div style={{ width: '100%', height: 220, marginTop: '10px' }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Radar name="Earned Points" dataKey="Earned" stroke="#1a4d2e" fill="#1a4d2e" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/pbas/evidence')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid #bbf7d0' }}>
              <div className="card-label" style={{ color: '#166534' }}>Evidence Vault</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a4d2e', marginTop: '6px' }}>
                📁 {summary.evidence_health.total_evidence_files || 39} Vault Documents
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '4px', fontWeight: 700 }}>
                Manage & Attach Certificates →
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;