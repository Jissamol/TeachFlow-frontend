import React, { useState, useEffect } from "react";

const EvidenceVault = () => {
  const [evidences, setEvidences] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    academic_year: "2025-26",
    category: "research",
    activity_title: "",
    file_name: "",
    file_type: "Certificate",
    file: null,
  });

  useEffect(() => {
    fetchEvidences();
  }, [selectedYear]);

  const fetchEvidences = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/evidence/?academic_year=${selectedYear}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setEvidences(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file,
        file_name: prev.file_name || file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const data = new FormData();
    data.append("academic_year", selectedYear);
    data.append("category", formData.category);
    data.append("activity_title", formData.activity_title);
    data.append("file_name", formData.file_name);
    data.append("file_type", formData.file_type);
    if (formData.file) data.append("file", formData.file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/evidence/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ academic_year: selectedYear, category: "research", activity_title: "", file_name: "", file_type: "Certificate", file: null });
        fetchEvidences();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this evidence record?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/evidence/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEvidences();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEvidences = evidences.filter(e => filterType === "All" || e.file_type === filterType);
  const verifiedCount = evidences.filter(e => e.status === "Verified").length;
  const completeness = evidences.length > 0 ? Math.round((verifiedCount / evidences.length) * 100) : 100;

  return (
    <>
      <style>{`
        .evidence-container { padding: 40px 30px; background: #fdfcfb; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #0d2c1a; }
        .evidence-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .evidence-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: #1a4d2e; margin: 0; }
        
        .year-select { padding: 10px 18px; border-radius: 12px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 0.95rem; color: #1a4d2e; background: #ffffff; cursor: pointer; outline: none; }
        .btn-add { background: #1a4d2e; color: #ffffff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-add:hover { background: #123620; }

        .metrics-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #ffffff; border: 1px solid rgba(26,77,46,0.08); border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .metric-val { font-size: 2rem; font-weight: 900; color: #1a4d2e; font-family: 'Playfair Display', serif; }
        .metric-lbl { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

        .filter-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
        .ftab { padding: 8px 18px; border-radius: 20px; border: 1px solid #e2e8f0; background: #ffffff; font-size: 0.85rem; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; }
        .ftab.active { background: #1a4d2e; color: #ffffff; border-color: #1a4d2e; }

        .evidence-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .evidence-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: transform 0.2s, box-shadow 0.2s; position: relative; }
        .evidence-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(26,77,46,0.08); }
        
        .badge-type { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; background: #f0fdf4; color: #166534; }
        .badge-status { font-size: 0.75rem; font-weight: 800; color: #16a34a; }
      `}</style>

      <div className="evidence-container">
        <div className="evidence-header">
          <div>
            <h1 className="evidence-title">Evidence & Certificate Vault</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              Digital Repository & Document Completeness Management
            </p>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <select className="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="2023-24">Academic Year: 2023-24</option>
              <option value="2024-25">Academic Year: 2024-25</option>
              <option value="2025-26">Academic Year: 2025-26</option>
              <option value="2026-27">Academic Year: 2026-27</option>
            </select>
            <button className="btn-add" onClick={() => setShowModal(true)}>+ Upload Evidence Document</button>
          </div>
        </div>

        <div className="metrics-banner">
          <div className="metric-card">
            <div className="metric-lbl">Total Documents</div>
            <div className="metric-val">{evidences.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Across {selectedYear}</div>
          </div>
          <div className="metric-card">
            <div className="metric-lbl">Evidence Completeness</div>
            <div className="metric-val" style={{ color: "#166534" }}>{completeness}%</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>{verifiedCount} Verified Files</div>
          </div>
          <div className="metric-card">
            <div className="metric-lbl">Repository Status</div>
            <div className="metric-val" style={{ fontSize: "1.4rem", marginTop: "6px" }}>✓ Active & Secure</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Ready for Audit Review</div>
          </div>
        </div>

        <div className="filter-tabs">
          {["All", "Certificate", "Publication (PDF)", "Appointment Letter", "Attendance / Logbook", "Other Evidence"].map(t => (
            <button 
              key={t} 
              className={`ftab ${filterType === (t === "Publication (PDF)" ? "Publication" : t === "Attendance / Logbook" ? "Attendance/Log" : t === "Other Evidence" ? "Other" : t) ? 'active' : ''}`}
              onClick={() => setFilterType(t === "Publication (PDF)" ? "Publication" : t === "Attendance / Logbook" ? "Attendance/Log" : t === "Other Evidence" ? "Other" : t)}
            >
              {t}
            </button>
          ))}
        </div>

        {showModal && (
          <div style={{ background: "#ffffff", padding: "30px", border: "1px solid #cbd5e1", borderRadius: "18px", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1a4d2e" }}>Upload Activity Evidence</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div><label style={{ fontWeight: 700 }}>Activity Title</label><input type="text" value={formData.activity_title} onChange={e => setFormData({ ...formData, activity_title: e.target.value })} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} /></div>
              <div><label style={{ fontWeight: 700 }}>Document Label</label><input type="text" value={formData.file_name} onChange={e => setFormData({ ...formData, file_name: e.target.value })} required placeholder="e.g. Scopus Paper Certificate" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} /></div>
              <div>
                <label style={{ fontWeight: 700 }}>Evidence Type</label>
                <select value={formData.file_type} onChange={e => setFormData({ ...formData, file_type: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <option value="Certificate">Certificate</option>
                  <option value="Publication">Publication (PDF)</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Attendance/Log">Attendance / Logbook</option>
                  <option value="Other">Other Evidence</option>
                </select>
              </div>
              <div><label style={{ fontWeight: 700 }}>Select File (PDF / Image)</label><input type="file" onChange={handleFileChange} required style={{ width: "100%", padding: 10 }} /></div>
              <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn-add">Save to Vault</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="evidence-grid">
          {filteredEvidences.map((item) => {
            const fileUrl = item.file ? (item.file.startsWith("http") ? item.file : `http://127.0.0.1:8000${item.file}`) : "#";
            return (
              <div key={item.id} className="evidence-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span className="badge-type">{item.file_type}</span>
                  <span className="badge-status">✓ {item.status}</span>
                </div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", color: "#1e293b" }}>{item.file_name}</h4>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
                  For: {item.activity_title} • Uploaded: {item.upload_date ? item.upload_date.slice(0,10) : 'Today'}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1a4d2e", fontWeight: 700, textDecoration: "none", fontSize: "0.85rem" }}>
                    📥 Preview / Download
                  </a>
                  <button onClick={() => handleDelete(item.id)} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EvidenceVault;
