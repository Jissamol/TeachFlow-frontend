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
        .report-container { padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: 'Work Sans', sans-serif; }
        .config-card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .type-btn { flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; font-size: 0.8rem; }
        .type-btn.active { border-color: #1a4d2e; color: #1a4d2e; background: #f0fdf4; }
        .btn-generate { width: 100%; background: #1a4d2e; color: white; border: none; padding: 20px; border-radius: 14px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s; margin-top: 30px; }
        .selection-item { display: flex; align-items: center; gap: 12px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; background: #fff; }
        .selection-item.active { border-color: #1a4d2e; background: #f0fdf4; }
      `}</style>

      <div className="report-container">
        <h1 style={{ textAlign: "center", color: "#1a4d2e", fontWeight: 800, marginBottom: 40, fontFamily: 'Crimson Pro' }}>PBAS Report Generator</h1>

        <div className="config-card">
          <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
            {['Yearly', 'Monthly', 'Custom'].map(t => (
              <button key={t} className={`type-btn ${reportType === t ? 'active' : ''}`} onClick={() => setReportType(t)}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={{ background: "#f8faf9", padding: 20, borderRadius: 12, marginBottom: 30 }}>
            {reportType === 'Yearly' && <select style={{ width: "100%", padding: 12 }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>}
            {reportType === 'Monthly' && <input type="month" style={{ width: "100%", padding: 12 }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />}
            {reportType === 'Custom' && <div style={{ display: "flex", gap: 10 }}><input type="date" style={{ flex: 1, padding: 12 }} value={startDate} onChange={e => setStartDate(e.target.value)}/><input type="date" style={{ flex: 1, padding: 12 }} value={endDate} onChange={e => setEndDate(e.target.value)}/></div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {Object.keys(selectedModules).map(key => (
              <div key={key} className={`selection-item ${selectedModules[key] ? 'active' : ''}`} onClick={() => toggleModule(key)}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{key.toUpperCase()}</span>
              </div>
            ))}
          </div>

          <button className="btn-generate" onClick={generatePDF}>{loading ? "Syncing..." : "GENERATE PDF REPORT"}</button>
        </div>
      </div>
    </>
  );
};

export default Report;
