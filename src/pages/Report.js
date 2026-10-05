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

  const generatePDF = async () => {
    setLoading(true);
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    let currentY = 40;
    let pageNum = 1;

    const drawHeader = (doc, pNum) => {
        doc.setFillColor(26, 77, 46);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("times", 'bold');
        doc.setFontSize(22);
        doc.text("PERFORMANCE DOSSIER", 14, 17);
        doc.setFont("helvetica", 'normal');
        doc.setFontSize(10);
        doc.text(`PAGE ${pNum}`, 180, 17);
    };
    
    drawHeader(doc, pageNum);

    const filterText = reportType === "Yearly" ? `Academic Year: ${filterYear}` : 
                      reportType === "Monthly" ? `Monthly Log: ${filterMonth}` : 
                      `Custom Range: ${startDate} to ${endDate}`;

    // Meta Block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 36, 'FD');
    doc.setFontSize(14); doc.setFont("times", 'bold'); doc.setTextColor(26, 77, 46);
    doc.text(`FACULTY RECORD: ${user.full_name ? user.full_name.toUpperCase() : "FACULTY MEMBER"}`, 20, currentY + 12);
    doc.setFontSize(10); doc.setFont("helvetica", 'normal'); doc.setTextColor(100);
    doc.text(`Department: ${user.department || "Academic"}  |  ${filterText}`, 20, currentY + 20);
    doc.setFont("helvetica", 'bold'); doc.setTextColor(22, 101, 52);
    doc.text(`OFFICIAL PBAS APPRAISAL & EVIDENCE VALIDATION DOSSIER`, 20, currentY + 28);
    
    currentY += 48;
    
    const sections = [
        { id: "teaching", title: "I. TEACHING & LEARNING (MAX 25 PTS)", data: allData.teaching.filter(checkMatch) },
        { id: "studentSupport", title: "II. MENTORSHIP & SUPPORT (MAX 15 PTS)", data: allData.studentSupport.filter(checkMatch) },
        { id: "research", title: "III. RESEARCH & PUBLICATION (MAX 60 PTS)", data: allData.research.filter(checkMatch) },
        { id: "academic", title: "IV. ACADEMIC ACHIEVEMENTS (MAX 25 PTS)", data: allData.academic.filter(checkMatch) },
        { id: "institutional", title: "V. INSTITUTIONAL SERVICE (MAX 25 PTS)", data: allData.institutional.filter(checkMatch) }
    ];

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000${url}`;
    };

    const addImageToDoc = async (url, x, y, maxWidth, maxHeight) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const ratio = img.width / img.height;
                let finalW = maxWidth;
                let finalH = maxWidth / ratio;
                if (finalH > maxHeight) {
                    finalH = maxHeight;
                    finalW = maxHeight * ratio;
                }
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg");
                doc.addImage(dataUrl, 'JPEG', x, y, finalW, finalH);
                resolve({ w: finalW, h: finalH });
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > 280) {
            doc.addPage();
            pageNum++;
            drawHeader(doc, pageNum);
            currentY = 40;
        }
    };

    for (const s of sections) {
        if (!selectedModules[s.id]) continue;
        
        checkPageBreak(30);
        doc.setFontSize(16); doc.setTextColor(26, 77, 46); doc.setFont("times", 'bold'); 
        doc.text(s.title, 14, currentY); 
        doc.setDrawColor(26, 77, 46); doc.setLineWidth(0.5);
        doc.line(14, currentY + 3, 196, currentY + 3);
        currentY += 15;
        
        if (s.data.length === 0) {
            doc.setFontSize(10); doc.setTextColor(150); doc.setFont("helvetica", 'italic'); 
            doc.text("No records submitted for this period.", 14, currentY); 
            currentY += 20;
            continue;
        }

        for (let i = 0; i < s.data.length; i++) {
            const entry = s.data[i];
            checkPageBreak(30);
            
            // Record Mini-Header with Score & Evidence Badge
            doc.setFillColor(240, 248, 244);
            doc.rect(14, currentY - 5, 182, 8, 'F');
            doc.setFontSize(9); doc.setFont("helvetica", 'bold'); doc.setTextColor(26, 77, 46);
            
            const scoreVal = entry.score !== undefined ? entry.score : 0;
            const evidenceBadge = entry.supporting_image ? "[✓ EVIDENCE VALIDATED]" : "[⚠️ NO PROOF ATTACHED]";
            doc.text(`RECORD #${i + 1}  •  CALCULATED SCORE: +${scoreVal} PTS  •  ${evidenceBadge}`, 16, currentY);
            currentY += 9;
            
            const excludedKeys = ['id', 'user', 'created_at', 'updated_at', 'supporting_image'];
            const keys = Object.keys(entry).filter(k => !excludedKeys.includes(k) && entry[k] !== null && entry[k] !== "");
            
            for (const key of keys) {
                checkPageBreak(12);
                doc.setFontSize(9); doc.setFont("helvetica", 'bold'); doc.setTextColor(100);
                const label = key.replace(/_/g, ' ').toUpperCase();
                doc.text(label, 16, currentY);
                
                doc.setFont("helvetica", 'normal'); doc.setTextColor(40);
                const val = String(entry[key]);
                const splitText = doc.splitTextToSize(val, 130);
                doc.text(splitText, 65, currentY);
                
                currentY += (splitText.length * 6);
            }
            
            if (entry.supporting_image) {
                checkPageBreak(90);
                doc.setFontSize(9); doc.setFont("helvetica", 'bold'); doc.setTextColor(100);
                doc.text("ATTACHED PROOF", 16, currentY + 5);
                
                const imgUrl = getImageUrl(entry.supporting_image);
                const imgResult = await addImageToDoc(imgUrl, 65, currentY, 100, 80);
                if (imgResult) {
                    currentY += imgResult.h + 10;
                } else {
                    doc.setFont("helvetica", 'italic'); doc.setTextColor(150);
                    doc.text("[Image unavailable]", 65, currentY + 5);
                    currentY += 15;
                }
            } else {
                currentY += 5;
            }
            currentY += 10;
        }
    }
    
    doc.save(`TeachFlow_PBAS_Dossier_${filterYear}.pdf`);
    setLoading(false);
  };

  const years = ["2023-2024", "2024-2025", "2025-2026"];

  return (
    <>
      <style>{`
        .pipeline-wrapper { min-height: 100vh; background-color: #f1f5f9; background-image: url('/report_bg.jpg'); background-size: cover; background-position: center; background-attachment: fixed; padding: 60px 20px; font-family: 'Work Sans', sans-serif; overflow-x: hidden; }
        .pipeline-title { text-align: center; color: #1a4d2e; font-family: 'Crimson Pro', serif; font-size: 3rem; font-weight: 800; margin-bottom: 60px; letter-spacing: 1px; text-shadow: 0 4px 15px rgba(255,255,255,0.8); }
        
        .pipeline-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; position: relative; }
        
        /* The central spine */
        .spine { position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: rgba(26,77,46,0.15); transform: translateX(-50%); z-index: 0; }
        
        .pipeline-node { position: relative; z-index: 1; width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 60px; }
        .node-label { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #1a4d2e; font-weight: 700; background: rgba(250, 248, 245, 0.95); backdrop-filter: blur(8px); padding: 10px 30px; border-radius: 30px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 15px rgba(26,77,46,0.05); }
        
        /* Timeframe Block (Box) */
        .timeframe-box { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); width: 100%; max-width: 500px; padding: 30px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.8); }
        .time-tabs { display: flex; gap: 10px; margin-bottom: 20px; background: rgba(241, 245, 249, 0.8); padding: 6px; border-radius: 12px; }
        .ttab { flex: 1; padding: 12px; background: transparent; border: none; font-weight: 800; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.9rem; letter-spacing: 0.5px; }
        .ttab.active { background: white; color: #1a4d2e; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .tinput { width: 100%; padding: 16px; border: 1px solid rgba(203,213,225,0.8); border-radius: 12px; font-size: 1.1rem; color: #1e293b; background: rgba(255,255,255,0.9); font-weight: 700; outline: none; text-align: center; transition: 0.3s; }
        .tinput:focus { border-color: #1a4d2e; background: white; }
        
        /* Table of Contents Selector */
        .toc-list { width: 100%; max-width: 700px; display: flex; flex-direction: column; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.8); padding: 40px; position: relative; z-index: 2; }
        .toc-item { display: flex; justify-content: space-between; align-items: baseline; padding: 20px 0; cursor: pointer; transition: 0.3s; border-bottom: 1px solid rgba(26,77,46,0.1); }
        .toc-item:last-child { border-bottom: none; padding-bottom: 0; }
        .toc-item:first-child { padding-top: 0; }
        .toc-item:hover .toc-title { transform: translateX(5px); }
        
        .toc-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #94a3b8; font-weight: 500; transition: 0.4s; display: flex; align-items: baseline; gap: 15px; }
        .toc-item.active .toc-title { color: #1a4d2e; font-weight: 800; }
        
        .toc-num { font-family: 'Work Sans', sans-serif; font-size: 1rem; color: #cbd5e1; font-weight: 700; transition: 0.4s; }
        .toc-item.active .toc-num { color: #1a4d2e; }
        
        .toc-status { display: flex; align-items: center; }
        
        .yn-group { display: flex; border: 1px solid rgba(26,77,46,0.2); border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.5); }
        .yn-btn { padding: 6px 14px; font-size: 0.75rem; font-weight: 800; transition: 0.3s; color: #94a3b8; letter-spacing: 1px; }
        
        .toc-item.active .yn-group { border-color: #1a4d2e; }
        .toc-item.active .yn-btn.yes { background: #1a4d2e; color: white; }
        .toc-item:not(.active) .yn-btn.no { background: #e2e8f0; color: #475569; }
        
        .toc-dot-leader { flex-grow: 1; border-bottom: 2px dotted rgba(26,77,46,0.2); margin: 0 20px; position: relative; top: -6px; transition: 0.4s; }
        .toc-item.active .toc-dot-leader { border-bottom: 2px dotted #1a4d2e; }
        
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
                  
                  <div className="toc-list">
                      {[
                          { id: 'teaching', num: '01.', label: 'Teaching & Learning' },
                          { id: 'studentSupport', num: '02.', label: 'Mentorship & Support' },
                          { id: 'research', num: '03.', label: 'Research & Publication' },
                          { id: 'academic', num: '04.', label: 'Academic Achievements' },
                          { id: 'institutional', num: '05.', label: 'Institutional Service' }
                      ].map(mod => (
                          <div key={mod.id} className={`toc-item ${selectedModules[mod.id] ? 'active' : ''}`} onClick={() => toggleModule(mod.id)}>
                              <span className="toc-title">
                                  <span className="toc-num">{mod.num}</span>
                                  {mod.label}
                              </span>
                              <div className="toc-dot-leader"></div>
                              <div className="toc-status">
                                  <div className="yn-group">
                                      <div className="yn-btn yes">YES</div>
                                      <div className="yn-btn no">NO</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
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
