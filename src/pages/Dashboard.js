import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [summary, setSummary] = useState({
    annual_target: 150,
    total_score: 0,
    target_percentage: 0,
    category_scores: {
      teaching: { score: 0, max: 25, count: 0 },
      student_support: { score: 0, max: 15, count: 0 },
      research: { score: 0, max: 60, count: 0 },
      academic_contributions: { score: 0, max: 25, count: 0 },
      institutional_responsibilities: { score: 0, max: 25, count: 0 },
    },
    evidence_health: {
      total_entries: 0,
      entries_with_evidence: 0,
      evidence_percentage: 100,
    }
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/summary/", {
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

  const radarData = [
    { subject: 'Teaching', Earned: summary.category_scores.teaching.score, Max: summary.category_scores.teaching.max },
    { subject: 'Support', Earned: summary.category_scores.student_support.score, Max: summary.category_scores.student_support.max },
    { subject: 'Research', Earned: summary.category_scores.research.score, Max: summary.category_scores.research.max },
    { subject: 'Academic', Earned: summary.category_scores.academic_contributions.score, Max: summary.category_scores.academic_contributions.max },
    { subject: 'Institutional', Earned: summary.category_scores.institutional_responsibilities.score, Max: summary.category_scores.institutional_responsibilities.max },
  ];

  const categoryBarData = [
    { name: 'Teaching', Score: summary.category_scores.teaching.score, Max: 25 },
    { name: 'Support', Score: summary.category_scores.student_support.score, Max: 15 },
    { name: 'Research', Score: summary.category_scores.research.score, Max: 60 },
    { name: 'Academic', Score: summary.category_scores.academic_contributions.score, Max: 25 },
    { name: 'Institutional', Score: summary.category_scores.institutional_responsibilities.score, Max: 25 },
  ];

  const pieGaugeData = [
    { name: 'Achieved', value: summary.total_score, fill: '#1a4d2e' },
    { name: 'Remaining', value: Math.max(0, summary.annual_target - summary.total_score), fill: '#e2e8f0' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
        
        .dashboard-container { 
          background: #fdfcfb; 
          min-height: 100vh; 
          padding: 30px; 
          font-family: 'Outfit', sans-serif; 
          color: #0d2c1a; 
        }

        .hero-banner {
          background: linear-gradient(135deg, #0d2c1a 0%, #1a4d2e 60%, #2e6a4f 100%);
          border-radius: 24px;
          padding: 30px 40px;
          color: #ffffff;
          box-shadow: 0 20px 40px rgba(13, 44, 26, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
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

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }

        .stat-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .stat-badge.success { background: #dcfce7; color: #166534; }
        .stat-badge.warning { background: #fef3c7; color: #92400e; }

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
          height: 10px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a4d2e, #22c55e);
          border-radius: 10px;
          transition: width 1s ease;
        }

        .category-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          background: #f8faf9;
          margin-bottom: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .category-row:hover { background: #f0f4f2; }
      `}</style>

      <div className="dashboard-container">
        {/* HERO BANNER */}
        <div className="hero-banner">
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, fontWeight: 700, marginBottom: '6px' }}>
              Academic Appraisal & Validation Hub
            </div>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display', margin: 0, fontWeight: 900 }}>
              Welcome, {userData?.full_name || 'Faculty Member'}
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
              Department of {userData?.department || 'Academic Excellence'} • Track PBAS Points & Validate Evidence
            </p>
          </div>
          <button className="btn-report" onClick={() => navigate('/pbas/report')}>
            ⚡ Generate Appraisal Report
          </button>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="card">
            <div className="card-label">Earned PBAS Score</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.total_score} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>/ {summary.annual_target} pts</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${summary.target_percentage}%` }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginTop: '6px' }}>
              {summary.target_percentage}% Annual Target Reached
            </div>
          </div>

          <div className="card">
            <div className="card-label">Evidence Health</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: summary.evidence_health.evidence_percentage >= 80 ? '#166534' : '#b45309', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.evidence_health.evidence_percentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              {summary.evidence_health.entries_with_evidence} of {summary.evidence_health.total_entries} Activities Validated
            </div>
            <span className={`stat-badge ${summary.evidence_health.evidence_percentage >= 80 ? 'success' : 'warning'}`} style={{ marginTop: '8px' }}>
              {summary.evidence_health.evidence_percentage >= 80 ? '✓ High Evidence Integrity' : '⚠️ Missing Documents'}
            </span>
          </div>

          <div className="card">
            <div className="card-label">Total Logged Activities</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0d2c1a', fontFamily: 'Playfair Display', marginTop: '6px' }}>
              {summary.evidence_health.total_entries}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Across 5 Appraisal Categories
            </div>
          </div>

          <div className="card">
            <div className="card-label">Top Category</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a4d2e', marginTop: '8px' }}>
              Research & Pubs
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
              {summary.category_scores.research.score} Points Logged
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid-layout">
          {/* LEFT: Category Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-label">PBAS Category Score Breakdown</div>
                <span className="stat-badge success">Live Engine Active</span>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Score" fill="#1a4d2e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Max" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-label" style={{ marginBottom: '15px' }}>Category Quick Actions & Live Points</div>
              
              <div className="category-row" onClick={() => navigate('/pbas/teaching')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>1. Teaching & Learning</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.category_scores.teaching.count} Courses Logged</div>
                </div>
                <div style={{ fontWeight: 800, color: '#1a4d2e' }}>+{summary.category_scores.teaching.score} pts</div>
              </div>

              <div className="category-row" onClick={() => navigate('/pbas/student-support')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>2. Student Support & Mentoring</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.category_scores.student_support.count} Activities Logged</div>
                </div>
                <div style={{ fontWeight: 800, color: '#1a4d2e' }}>+{summary.category_scores.student_support.score} pts</div>
              </div>

              <div className="category-row" onClick={() => navigate('/pbas/research')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>3. Research & Publications</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.category_scores.research.count} Papers / Projects Logged</div>
                </div>
                <div style={{ fontWeight: 800, color: '#1a4d2e' }}>+{summary.category_scores.research.score} pts</div>
              </div>

              <div className="category-row" onClick={() => navigate('/pbas/academic')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>4. Academic Contributions</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.category_scores.academic_contributions.count} Lectures / Awards</div>
                </div>
                <div style={{ fontWeight: 800, color: '#1a4d2e' }}>+{summary.category_scores.academic_contributions.score} pts</div>
              </div>

              <div className="category-row" onClick={() => navigate('/pbas/institutional')}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>5. Institutional Responsibilities</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{summary.category_scores.institutional_responsibilities.count} Roles & Duties</div>
                </div>
                <div style={{ fontWeight: 800, color: '#1a4d2e' }}>+{summary.category_scores.institutional_responsibilities.score} pts</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Radar & Target Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-label" style={{ marginBottom: '10px' }}>Annual Target Completion</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieGaugeData} innerRadius={45} outerRadius={65} dataKey="value" startAngle={180} endAngle={0} stroke="none">
                    <Cell fill="#1a4d2e" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '-40px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display' }}>
                  {summary.target_percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Target: {summary.annual_target} Points</div>
              </div>
            </div>

            <div className="card">
              <div className="card-label">Appraisal Radar</div>
              <div style={{ width: '100%', height: 240, marginTop: '10px' }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Radar name="Earned Score" dataKey="Earned" stroke="#1a4d2e" fill="#1a4d2e" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;