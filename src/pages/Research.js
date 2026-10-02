import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Research = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    research_type: "Journal",
    title: "",
    journal_or_funding: "",
    status_or_impact: "",
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
      const res = await fetch("http://127.0.0.1:8000/api/pbas/research/", {
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
      ? `http://127.0.0.1:8000/api/pbas/research/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/research/";
    
    const data = new FormData();
    data.append("academic_year", formData.academic_year);
    data.append("research_type", formData.research_type);
    data.append("title", formData.title);
    data.append("journal_or_funding", formData.journal_or_funding);
    data.append("status_or_impact", formData.status_or_impact);
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
        research_type: "Journal",
        title: "",
        journal_or_funding: "",
        status_or_impact: "",
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
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/research/${id}/`, {
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
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
        .summary-val { font-size: 1.8rem; font-weight: 800; color: #1a4d2e; font-family: 'Crimson Pro', serif; }
        .summary-label { color: #6b7280; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        
        /* New Timeline Layout Styling */
        .timeline-container { display: flex; flex-direction: column; gap: 0; margin-top: 20px; }
        .timeline-item { display: flex; gap: 24px; }
        .timeline-marker { display: flex; flex-direction: column; align-items: center; width: 24px; margin-top: 4px; }
        .timeline-dot { width: 20px; height: 20px; background: white; border: 5px solid #1a4d2e; border-radius: 50%; z-index: 2; box-shadow: 0 0 0 4px #e8f5e9; flex-shrink: 0; }
        .timeline-line { width: 2px; background: #cbd5e1; flex-grow: 1; margin: 8px 0; border-radius: 2px; }
        
        .timeline-content { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; flex-grow: 1; margin-bottom: 32px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; position: relative; }
        .timeline-content:hover { transform: translateX(6px); box-shadow: 0 15px 30px rgba(26,77,46,0.06); border-color: #1a4d2e40; }
        .timeline-content::before { content: ''; position: absolute; left: -9px; top: 28px; width: 16px; height: 16px; background: white; border-left: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; transform: rotate(45deg); transition: border-color 0.2s; }
        .timeline-content:hover::before { border-color: #1a4d2e40; }
        
        .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .timeline-type { background: #1a4d2e; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(26,77,46,0.2); }
        .timeline-date { color: #64748b; font-size: 0.85rem; font-weight: 600; background: #f8fafc; padding: 4px 12px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .timeline-title { font-size: 1.5rem; color: #1e293b; margin: 0 0 20px 0; font-family: 'Playfair Display', serif; font-weight: 800; line-height: 1.3; }
        
        .timeline-meta { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .meta-pill { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; padding: 8px 14px; border-radius: 10px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }
        .meta-pill.success { background: #f0fdf4; border-color: #bbf7d0; color: #166534; font-weight: 600; }
        
        .timeline-actions { display: flex; gap: 20px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
        .btn-edit { color: #1a4d2e; font-weight: 700; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; font-size: 0.9rem; transition: color 0.2s; }
        .btn-edit:hover { color: #123620; text-decoration: underline; }
        .btn-delete { color: #ef4444; font-weight: 700; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; font-size: 0.9rem; transition: color 0.2s; }
        .btn-delete:hover { color: #b91c1c; text-decoration: underline; }
      `}</style>
      
      <div className="pbas-container">
        <div className="pbas-header"><h1 className="pbas-title">Research & Publication</h1><button className="btn-toggle" onClick={handleToggleForm}>{showForm ? 'Cancel' : (editingId ? 'Edit' : '+ Add')}</button></div>
        {showForm && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div><label>Year</label><input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Type</label><select name="research_type" value={formData.research_type} onChange={handleChange} style={{ width: '100%', padding: 10 }}><option value="Journal">Journal</option><option value="Conference">Conference</option><option value="Project">Project</option><option value="Guidance">Guidance</option><option value="Patent">Patent</option><option value="Book">Book</option></select></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Publish/Funding Date From</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Publish/Funding Date To</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Journal/Agency</label><input type="text" name="journal_or_funding" value={formData.journal_or_funding} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Impact/Status</label><input type="text" name="status_or_impact" value={formData.status_or_impact} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Proof</label><input type="file" onChange={handleFileChange} style={{ width: '100%', padding: 10 }} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="filter-input" style={{ width: '100%', padding: 10, minHeight: 80 }} placeholder="Additional details..." /></div>
                    </div>
                    <button type="submit" className="btn-toggle" style={{ marginTop: 20, width: "100%" }}>Save Research</button>
                </form>
            </div>
        )}

        <div className="timeline-container">
            {filteredEntries.map((entry, index) => (
                <div key={entry.id} className="timeline-item">
                    <div className="timeline-marker">
                        <div className="timeline-dot"></div>
                        {index !== filteredEntries.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                        <div className="timeline-header">
                            <span className="timeline-type">{entry.research_type}</span>
                            <span className="timeline-date">🗓 {entry.from_date} to {entry.to_date}</span>
                        </div>
                        
                        <h3 className="timeline-title">{entry.title}</h3>
                        
                        <div className="timeline-meta">
                            <div className="meta-pill"><strong>Academic Year:</strong> {entry.academic_year}</div>
                        </div>
                        
                        {entry.supporting_image && (
                            <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', maxHeight: '250px' }}>
                                <img src={entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`} alt="Proof Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        
                        <div className="timeline-actions">
                            <button onClick={() => handleEdit(entry)} className="btn-edit">✎ Edit Details</button>
                            <button onClick={() => deleteEntry(entry.id)} className="btn-delete">🗑 Remove Entry</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Research;
