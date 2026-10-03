import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AcademicContribution = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    contribution_type: "Invited Lecture",
    title: "",
    event_name: "",
    organization: "",
    date: "",
    from_date: "",
    to_date: "",
    description: "",
    supporting_image: null
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/academic-contributions/", {
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
      ? `http://127.0.0.1:8000/api/pbas/academic-contributions/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/academic-contributions/";
    
    const data = new FormData();
    data.append("academic_year", formData.academic_year);
    data.append("contribution_type", formData.contribution_type);
    data.append("title", formData.title);
    data.append("event_name", formData.event_name);
    data.append("organization", formData.organization);
    data.append("date", formData.date || formData.from_date || "");
    data.append("from_date", formData.from_date);
    data.append("to_date", formData.to_date);
    data.append("description", formData.description || "");
    if (formData.supporting_image instanceof File) data.append("supporting_image", formData.supporting_image);

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });
      if (res.ok) { setShowForm(false); setEditingId(null); fetchEntries(); }
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
        contribution_type: "Invited Lecture",
        title: "",
        event_name: "",
        organization: "",
        date: "",
        from_date: "",
        to_date: "",
        description: "",
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
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/academic-contributions/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEntries();
    } catch (err) {}
  };

  const filteredEntries = entries.filter(entry => entry.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.from_date) - new Date(a.from_date));

  return (
    <>
      <style>{`
        .pbas-container { padding: 40px 20px; max-width: 1400px; margin: 0 auto; font-family: 'Work Sans', sans-serif; background: #faf8f5; min-height: 100vh; }
        .pbas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .pbas-title { font-family: 'Crimson Pro', serif; font-size: 2.2rem; color: #1a4d2e; font-weight: 700; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        
        /* Plaque Layout Styling */
        .plaque-list { display: flex; flex-direction: column; gap: 20px; }
        .plaque-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; border-left: 6px solid #b45309; box-shadow: 0 4px 15px rgba(0,0,0,0.04); display: flex; align-items: stretch; transition: 0.3s; overflow: hidden; position: relative; }
        .plaque-card:hover { transform: translateX(5px); box-shadow: 0 10px 25px rgba(180,83,9,0.1); border-left-color: #d97706; }
        
        .plaque-visual { width: 140px; background: #fffbeb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; border-right: 1px dashed #fcd34d; }
        .plaque-icon { font-size: 3rem; color: #d97706; text-shadow: 0 2px 10px rgba(217,119,6,0.2); }
        .plaque-image { width: 100%; height: 100%; object-fit: cover; }
        
        .plaque-content { padding: 24px 30px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
        .plaque-type { text-transform: uppercase; letter-spacing: 1px; font-size: 0.7rem; font-weight: 800; color: #b45309; }
        .plaque-title { font-size: 1.4rem; font-weight: 700; color: #1e293b; font-family: 'Playfair Display', serif; margin: 0; }
        .plaque-org { color: #475569; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        
        .plaque-meta { width: 220px; background: #faf8f5; padding: 24px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; border-left: 1px solid #e2e8f0; flex-shrink: 0; text-align: right; }
        .plaque-date { font-size: 0.85rem; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .plaque-year { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        
        .plaque-actions { display: flex; gap: 12px; margin-top: 16px; }
        .btn-edit { color: #1a4d2e; font-weight: 600; background: #e8f5e9; border: none; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; transition: 0.2s; }
        .btn-edit:hover { background: #c8e6c9; }
        .btn-delete { color: #dc2626; font-weight: 600; background: #fef2f2; border: none; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; transition: 0.2s; }
        .btn-delete:hover { background: #fee2e2; }
      `}</style>
      
      <div className="pbas-container">
        <div className="pbas-header"><h1 className="pbas-title">Academic Achievements</h1><button className="btn-toggle" onClick={handleToggleForm}>{showForm ? 'Cancel' : (editingId ? 'Edit' : '+ Add')}</button></div>
        {showForm && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div><label>Year</label><input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Type</label><select name="contribution_type" value={formData.contribution_type} onChange={handleChange} style={{ width: '100%', padding: 10 }}><option value="Invited Lecture">Invited Lecture</option><option value="Resource Person">Resource Person</option><option value="Paper Presentation">Paper Presentation</option><option value="Award/Fellowship">Award/Fellowship</option><option value="Policy Document">Policy Document</option><option value="Other">Other</option></select></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Title/Topic</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Validity From</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Validity To</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Event</label><input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Organization</label><input type="text" name="organization" value={formData.organization} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Proof</label><input type="file" onChange={handleFileChange} style={{ width: '100%', padding: 10 }} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="filter-input" style={{ width: '100%', padding: 10, minHeight: 80 }} placeholder="Further details..." /></div>
                    </div>
                    <button type="submit" className="btn-toggle" style={{ marginTop: 20, width: "100%" }}>Save Achievement</button>
                </form>
            </div>
        )}

        <div className="plaque-list">
          {filteredEntries.map(entry => {
              const bgUrl = entry.supporting_image ? (entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`) : null;
              
              const getIcon = (type) => {
                  const t = type.toLowerCase();
                  if(t.includes('award') || t.includes('fellowship')) return '🏆';
                  if(t.includes('lecture')) return '🎙️';
                  if(t.includes('paper')) return '📄';
                  if(t.includes('resource')) return '🌟';
                  return '🎖️';
              };

              return (
              <div key={entry.id} className="plaque-card">
                  <div className="plaque-visual">
                      {bgUrl ? (
                          <img src={bgUrl} alt="Proof" className="plaque-image" />
                      ) : (
                          <span className="plaque-icon">{getIcon(entry.contribution_type)}</span>
                      )}
                  </div>
                  
                  <div className="plaque-content">
                      <span className="plaque-type">{entry.contribution_type}</span>
                      <h3 className="plaque-title">{entry.title}</h3>
                      <div className="plaque-org">
                          <span>🏢 {entry.organization}</span>
                          {entry.event_name && <span>• 🎪 {entry.event_name}</span>}
                      </div>
                  </div>
                  
                  <div className="plaque-meta">
                      <span className="plaque-date">{entry.from_date} to {entry.to_date}</span>
                      <span className="plaque-year">{entry.academic_year}</span>
                      <div className="plaque-actions">
                          <button onClick={() => handleEdit(entry)} className="btn-edit">✎ Edit</button>
                          <button onClick={() => deleteEntry(entry.id)} className="btn-delete">🗑 Delete</button>
                      </div>
                  </div>
              </div>
          )})}
        </div>
      </div>
    </>
  );
};

export default AcademicContribution;
