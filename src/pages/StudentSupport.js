import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentSupport = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("All");

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    activity_name: "Remedial Coaching",
    description: "",
    target_audience: "",
    hours_spent: "",
    from_date: "",
    to_date: "",
    supporting_image: null
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/student-support/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setEntries(await res.json());
    } catch (err) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, supporting_image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const url = editingId 
      ? `http://127.0.0.1:8000/api/pbas/student-support/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/student-support/";
    
    const data = new FormData();
    data.append("academic_year", formData.academic_year);
    data.append("activity_name", formData.activity_name);
    data.append("target_audience", formData.target_audience);
    data.append("hours_spent", formData.hours_spent);
    data.append("description", formData.description || "");
    data.append("from_date", formData.from_date);
    data.append("to_date", formData.to_date);
    if (formData.supporting_image instanceof File) data.append("supporting_image", formData.supporting_image);

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        setShowForm(false); setEditingId(null); fetchEntries();
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleEdit = (entry) => {
    setFormData({ ...entry, supporting_image: null, from_date: entry.from_date || "", to_date: entry.to_date || "" });
    setEditingId(entry.id); setShowForm(true);
  };

  const handleToggleForm = () => {
    if (!showForm) {
      setFormData({
        academic_year: "2024-2025",
        activity_name: "",
        description: "",
        target_audience: "",
        hours_spent: "",
        from_date: "",
        to_date: "",
        supporting_image: null
      });
      setEditingId(null);
    }
    setShowForm(!showForm);
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/student-support/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEntries();
    } catch (err) {}
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.activity_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "All" || entry.academic_year === filterYear;
    return matchesSearch && matchesYear;
  }).sort((a, b) => new Date(b.from_date) - new Date(a.from_date));

  return (
    <>
      <style>{`
        .pbas-container { padding: 40px 20px; max-width: 1400px; margin: 0 auto; font-family: 'Work Sans', sans-serif; background: #faf8f5; min-height: 100vh; }
        .pbas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .pbas-title { font-family: 'Crimson Pro', serif; font-size: 2.2rem; color: #1a4d2e; font-weight: 700; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
        .summary-val { font-size: 1.8rem; font-weight: 800; color: #1a4d2e; font-family: 'Crimson Pro', serif; }
        .summary-label { color: #6b7280; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        
        /* Metric Card Grid */
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .metric-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; flex-direction: column; position: relative; transition: 0.3s; }
        .metric-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(26,77,46,0.08); }
        
        .metric-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .metric-title { font-size: 1.35rem; font-weight: 700; color: #1e293b; font-family: 'Playfair Display', serif; line-height: 1.3; }
        .metric-audience { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 8px; display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
        
        .metric-hours-circle { width: 75px; height: 75px; border-radius: 50%; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border: 4px solid white; box-shadow: 0 4px 15px rgba(26,77,46,0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 16px; color: #1a4d2e; }
        .metric-hours-val { font-size: 1.8rem; font-weight: 800; line-height: 1; font-family: 'Crimson Pro', serif; }
        .metric-hours-lbl { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-top: 2px; }

        .metric-details { display: flex; flex-direction: column; gap: 12px; flex-grow: 1; }
        .metric-row { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: #475569; background: #f8fafc; padding: 12px 16px; border-radius: 12px; font-weight: 500; border: 1px solid #f1f5f9; }
        .metric-icon { color: #1a4d2e; font-size: 1.2rem; }
        
        .metric-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        
        .btn-edit { color: #1a4d2e; font-weight: 600; background: #e8f5e9; border: none; cursor: pointer; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; }
        .btn-edit:hover { background: #c8e6c9; }
        .btn-delete { color: #dc2626; font-weight: 600; background: #fef2f2; border: none; cursor: pointer; padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; }
        .btn-delete:hover { background: #fee2e2; }
      `}</style>
      
      <div className="pbas-container">
        <div className="pbas-header"><h1 className="pbas-title">Mentorship & Support</h1><button className="btn-toggle" onClick={handleToggleForm}>{showForm ? 'Cancel' : (editingId ? 'Edit' : '+ Add')}</button></div>
        <div className="summary-grid"><div className="summary-card"><div className="summary-val">{entries.length}</div><div className="summary-label">Total Activities</div></div><div className="summary-card"><div className="summary-val">{entries.reduce((a,c)=>a+(parseInt(c.hours_spent)||0),0)}</div><div className="summary-label">Total Hours</div></div></div>

        {showForm && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div><label>Year</label><input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Activity</label><input type="text" name="activity_name" value={formData.activity_name} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Target</label><input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>From Date</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>To Date</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Hours</label><input type="number" name="hours_spent" value={formData.hours_spent} onChange={handleChange} className="filter-input" required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Proof</label><input type="file" onChange={handleFileChange} className="filter-input" style={{ width: '100%', padding: 10 }} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="filter-input" style={{ width: '100%', padding: 10, minHeight: 80 }} placeholder="Describe the activity..." /></div>
                    </div>
                    <button type="submit" className="btn-toggle" style={{ marginTop: 20, width: "100%" }}>Save Record</button>
                </form>
            </div>
        )}

        <div className="metric-grid">
          {filteredEntries.map(entry => (
              <div key={entry.id} className="metric-card">
                  <div className="metric-header">
                      <div>
                          <h3 className="metric-title">{entry.activity_name}</h3>
                          <span className="metric-audience">🎯 Target: {entry.target_audience}</span>
                      </div>
                      <div className="metric-hours-circle">
                          <span className="metric-hours-val">{entry.hours_spent}</span>
                          <span className="metric-hours-lbl">Hrs</span>
                      </div>
                  </div>
                  
                  <div className="metric-details">
                      <div className="metric-row">
                          <span className="metric-icon">🗓️</span>
                          <div><strong>Year:</strong> {entry.academic_year}</div>
                      </div>
                      <div className="metric-row">
                          <span className="metric-icon">⏱️</span>
                          <div><strong>Period:</strong> {entry.from_date} to {entry.to_date}</div>
                      </div>
                      
                      {entry.supporting_image && (
                          <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', height: '140px', border: '1px solid #e2e8f0' }}>
                              <img src={entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                      )}
                  </div>
                  
                  <div className="metric-footer">
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <button onClick={() => handleEdit(entry)} className="btn-edit" style={{ flex: 1 }}>✎ Edit</button>
                          <button onClick={() => deleteEntry(entry.id)} className="btn-delete" style={{ flex: 1 }}>🗑 Delete</button>
                      </div>
                  </div>
              </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudentSupport;
