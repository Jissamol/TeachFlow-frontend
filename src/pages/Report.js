import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [reportType, setReportType] = useState("Yearly"); 
  const [filterYear, setFilterYear] = useState("2024-2025");
  const [filterMonth, setFilterMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedModules, setSelectedModules] = useState({
    teaching: true,
    studentSupport: true,
    research: true,
    academic: true,
    institutional: true
  });

  const [allData, setAllData] = useState({
    teaching: [],
    studentSupport: [],
    research: [],
    academic: [],
    institutional: []
  });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/"); return; }
    const eps = ["teaching", "student-support", "research", "academic-contributions", "institutional-responsibilities"];
    setLoading(true);
    try {
      const results = await Promise.all(eps.map(e => 
        fetch(`http://127.0.0.1:8000/api/pbas/${e}/`, { headers: { "Authorization": `Bearer ${token}` }})
        .then(res => res.ok ? res.json() : [])
      ));
      setAllData({ teaching: results[0], studentSupport: results[1], research: results[2], academic: results[3], institutional: results[4] });
    } catch (err) {} finally { setLoading(false); }
  };

  const toggleModule = (mod) => setSelectedModules(prev => ({ ...prev, [mod]: !prev[mod] }));

  const checkMatch = (entry) => {
    const entryFrom = entry.from_date || entry.date || entry.created_at?.slice(0, 10);
    const entryTo = entry.to_date || entry.date || entry.created_at?.slice(0, 10);

    if (reportType === "Yearly") return entry.academic_year === filterYear;
    
    if (reportType === "Monthly") {
        const monthStart = `${filterMonth}-01`;
        const monthEnd = `${filterMonth}-31`; // Simplified
        return entryFrom <= monthEnd && entryTo >= monthStart;
    }

    if (reportType === "Custom") {
        if (!startDate || !endDate) return false;
        return entryFrom <= endDate && entryTo >= startDate;
    }
    return false;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    doc.setFontSize(22);
    doc.setTextColor(26, 77, 46); 
    doc.text("TeachFlow PBAS Official Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const filterText = reportType === "Yearly" ? `Academic Year: ${filterYear}` : 
                      reportType === "Monthly" ? `Monthly Log: ${filterMonth}` : 
                      `Custom Range: ${startDate} to ${endDate}`;
    doc.text(filterText, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setDrawColor(200);
    doc.rect(14, 42, 182, 15);
    doc.text(`Faculty Record: ${user.username || "Staff Member"}`, 18, 51);

    let currentY = 70;
    const sections = [
        { id: "teaching", title: "1. Teaching & Learning", data: allData.teaching.filter(checkMatch), headers: [["Course", "From", "To", "Assigned", "Taught"]], mapping: (d) => [d.course_name, d.from_date, d.to_date, d.classes_assigned, d.classes_taught] },
        { id: "studentSupport", title: "2. Student Support", data: allData.studentSupport.filter(checkMatch), headers: [["Activity", "From", "To", "Audience", "Hours"]], mapping: (d) => [d.activity_name, d.from_date, d.to_date, d.target_audience, d.hours_spent] },
        { id: "research", title: "3. Research Works", data: allData.research.filter(checkMatch), headers: [["Type", "From", "To", "Title", "Status"]], mapping: (d) => [d.research_type, d.from_date, d.to_date, d.title, d.status_or_impact] },
        { id: "academic", title: "4. Contributions", data: allData.academic.filter(checkMatch), headers: [["Type", "From", "To", "Title", "Org"]], mapping: (d) => [d.contribution_type, d.from_date, d.to_date, d.title, d.organization] },
        { id: "institutional", title: "5. Institutional Duty", data: allData.institutional.filter(checkMatch), headers: [["Type", "From", "To", "Position"]], mapping: (d) => [d.responsibility_type, d.from_date, d.to_date, d.position] }
    ];

    sections.forEach((s) => {
        if (!selectedModules[s.id]) return;
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setFontSize(11); doc.setTextColor(26, 77, 46); doc.setFont("helvetica", 'bold'); doc.text(s.title, 14, currentY); currentY += 5;
        if (s.data.length === 0) {
            doc.setFontSize(9); doc.setTextColor(150); doc.setFont("helvetica", 'normal'); doc.text("- No matching records found.", 14, currentY); currentY += 12;
        } else {
            autoTable(doc, {
                startY: currentY, head: s.headers, body: s.data.map(s.mapping),
                headStyles: { fillColor: [26, 77, 46], textColor: [255, 255, 255], fontSize: 8 },
                bodyStyles: { fontSize: 7.5 }, margin: { left: 14, right: 14 }, theme: 'grid'
            });
            currentY = doc.lastAutoTable.finalY + 12;
        }
    });

    const pc = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pc; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150); doc.text(`Document Page ${i} of ${pc}`, 105, 285, { align: "center" }); }
    doc.save(`Report_${reportType}_${filterYear}.pdf`);
  };

  const years = ["2023-2024", "2024-2025", "2025-2026"];

  return (
    <>
      <style>{`
        .pipeline-wrapper { min-height: 100vh; background: #faf8f5; padding: 60px 20px; font-family: 'Work Sans', sans-serif; overflow-x: hidden; }
        .pipeline-title { text-align: center; color: #1a4d2e; font-family: 'Crimson Pro', serif; font-size: 3rem; font-weight: 800; margin-bottom: 60px; letter-spacing: 1px; }
        
        .pipeline-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; position: relative; }
        
        /* The central spine */
        .spine { position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: #e2e8f0; transform: translateX(-50%); z-index: 0; }
        
        .pipeline-node { position: relative; z-index: 1; width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 60px; }
        .node-label { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #1a4d2e; font-weight: 700; background: #faf8f5; padding: 10px 30px; border-radius: 30px; margin-bottom: 30px; border: 2px solid #c8e6c9; box-shadow: 0 4px 15px rgba(26,77,46,0.05); }
        
        /* Timeframe Block (Box) */
        .timeframe-box { background: white; width: 100%; max-width: 500px; padding: 30px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .time-tabs { display: flex; gap: 10px; margin-bottom: 20px; background: #f1f5f9; padding: 6px; border-radius: 12px; }
        .ttab { flex: 1; padding: 12px; background: transparent; border: none; font-weight: 800; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.9rem; letter-spacing: 0.5px; }
        .ttab.active { background: white; color: #1a4d2e; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .tinput { width: 100%; padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 1.1rem; color: #1e293b; background: #f8fafc; font-weight: 700; outline: none; text-align: center; transition: 0.3s; }
        .tinput:focus { border-color: #1a4d2e; background: white; }
        
        /* Module Strips */
        .module-strip { width: 100%; max-width: 600px; display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; border-radius: 100px; margin: 12px 0; cursor: pointer; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid #cbd5e1; background: white; position: relative; overflow: hidden; }
        .module-strip::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0%; background: #1a4d2e; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; }
        .module-strip.active { border-color: #1a4d2e; transform: scale(1.03); box-shadow: 0 15px 30px rgba(26,77,46,0.15); }
        .module-strip.active::before { width: 100%; }
        
        .strip-text { position: relative; z-index: 1; font-size: 1.2rem; font-weight: 800; color: #475569; letter-spacing: 1px; transition: 0.4s; text-transform: uppercase; }
        .module-strip.active .strip-text { color: white; }
        
        .strip-toggle { position: relative; z-index: 1; width: 56px; height: 32px; border-radius: 20px; background: #e2e8f0; transition: 0.4s; border: 2px solid #94a3b8; }
        .strip-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; background: white; border-radius: 50%; transition: 0.4s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .module-strip.active .strip-toggle { background: #4ade80; border-color: #4ade80; }
        .module-strip.active .strip-toggle::after { transform: translateX(24px); }
        
        /* Generate Button Node */
        .btn-generate-node { width: 220px; height: 220px; border-radius: 50%; background: linear-gradient(135deg, #1a4d2e, #2d6a4f); color: white; display: flex; justify-content: center; align-items: center; font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; cursor: pointer; transition: 0.4s; box-shadow: 0 15px 40px rgba(26,77,46,0.3); border: none; z-index: 2; position: relative; text-align: center; line-height: 1.2; padding: 20px; }
        .btn-generate-node:hover { transform: scale(1.05); box-shadow: 0 20px 50px rgba(26,77,46,0.4); }
        .pulse-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 4px solid #1a4d2e; animation: pulse 2s infinite; z-index: -1; top: 0; left: 0; box-sizing: border-box; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>

      <div className="pipeline-wrapper">
          <h1 className="pipeline-title">Report Generator</h1>
          
          <div className="pipeline-container">
              <div className="spine"></div>
              
              {/* NODE 1: TIMEFRAME */}
              <div className="pipeline-node">
                  <span className="node-label">PHASE 1: TIMEFRAME</span>
                  <div className="timeframe-box">
                      <div className="time-tabs">
                          {['Yearly', 'Monthly', 'Custom'].map(t => (
                              <button key={t} className={`ttab ${reportType === t ? 'active' : ''}`} onClick={() => setReportType(t)}>{t.toUpperCase()}</button>
                          ))}
                      </div>
                      
                      {reportType === 'Yearly' && <select className="tinput" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>}
                      {reportType === 'Monthly' && <input type="month" className="tinput" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />}
                      {reportType === 'Custom' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                              <input type="date" className="tinput" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                              <input type="date" className="tinput" value={endDate} onChange={e => setEndDate(e.target.value)}/>
                          </div>
                      )}
                  </div>
              </div>
              
              {/* NODE 2: MODULES */}
              <div className="pipeline-node">
                  <span className="node-label">PHASE 2: DATA INCLUSION</span>
                  
                  {[
                      { id: 'teaching', label: 'Teaching & Learning' },
                      { id: 'studentSupport', label: 'Mentorship & Support' },
                      { id: 'research', label: 'Research & Publication' },
                      { id: 'academic', label: 'Academic Achievements' },
                      { id: 'institutional', label: 'Institutional Service' }
                  ].map(mod => (
                      <div key={mod.id} className={`module-strip ${selectedModules[mod.id] ? 'active' : ''}`} onClick={() => toggleModule(mod.id)}>
                          <span className="strip-text">{mod.label}</span>
                          <div className="strip-toggle"></div>
                      </div>
                  ))}
              </div>
              
              {/* NODE 3: GENERATE */}
              <div className="pipeline-node" style={{ marginBottom: 0 }}>
                  <button className="btn-generate-node" onClick={generatePDF}>
                      <div className="pulse-ring"></div>
                      {loading ? "SYNCING..." : "GENERATE PDF"}
                  </button>
              </div>
              
          </div>
      </div>
    </>
  );
};

export default Report;
