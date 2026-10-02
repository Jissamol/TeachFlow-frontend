import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InstitutionalResponsibility = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    responsibility_type: "Administrative",
    position: "",
    description: "",
    from_date: "",
    to_date: "",
    supporting_image: null
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/institutional-responsibilities/", {
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
      ? `http://127.0.0.1:8000/api/pbas/institutional-responsibilities/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/institutional-responsibilities/";
    
    const data = new FormData();
    data.append("academic_year", formData.academic_year);
    data.append("responsibility_type", formData.responsibility_type);
    data.append("position", formData.position);
    data.append("description", formData.description);
    data.append("from_date", formData.from_date);
    data.append("to_date", formData.to_date);
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
        responsibility_type: "Administrative",
        position: "",
        description: "",
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
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/institutional-responsibilities/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEntries();
    } catch (err) {}
  };

  const filteredEntries = entries.filter(entry => entry.position.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.from_date) - new Date(a.from_date));

  return (
    <>
      <style>{`
        .pbas-container { padding: 40px 20px; max-width: 1400px; margin: 0 auto; font-family: 'Work Sans', sans-serif; background: #faf8f5; min-height: 100vh; }
        .pbas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .pbas-title { font-family: 'Crimson Pro', serif; font-size: 2.2rem; color: #1a4d2e; font-weight: 700; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        
        /* ID Badge Layout */
        .id-badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; margin-top: 20px; }
        .id-badge { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.04); position: relative; }
        .id-badge:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(26,77,46,0.08); border-color: #c8e6c9; }
        
        .id-header { height: 100px; background: linear-gradient(135deg, #1a4d2e, #2d6a4f); position: relative; display: flex; justify-content: center; }
        .id-type { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.3); }
        
        .id-avatar-wrapper { width: 90px; height: 90px; border-radius: 50%; background: white; position: absolute; bottom: -45px; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; z-index: 2; }
        .id-avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .id-avatar-icon { font-size: 2.2rem; color: #1a4d2e; }
        
        .id-body { padding: 60px 24px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; flex-grow: 1; }
        .id-position { font-size: 1.3rem; font-weight: 800; color: #1e293b; font-family: 'Playfair Display', serif; line-height: 1.2; margin-bottom: 8px; }
        .id-desc { font-size: 0.85rem; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
        
        .id-meta-grid { display: grid; grid-template-columns: 1fr 1fr; width: 100%; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
        .id-meta-item { display: flex; flex-direction: column; align-items: center; }
        .id-meta-lbl { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .id-meta-val { font-size: 0.85rem; color: #1e293b; font-weight: 600; }
        
        .id-actions { display: flex; gap: 10px; width: 100%; }
        .btn-edit { color: #1a4d2e; font-weight: 600; background: #e8f5e9; border: none; cursor: pointer; padding: 8px; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; flex: 1; }
        .btn-edit:hover { background: #c8e6c9; }
        .btn-delete { color: #dc2626; font-weight: 600; background: #fef2f2; border: none; cursor: pointer; padding: 8px; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; flex: 1; }
        .btn-delete:hover { background: #fee2e2; }
      `}</style>
      
      <div className="pbas-container">
        <div className="pbas-header"><h1 className="pbas-title">Institutional Service</h1><button className="btn-toggle" onClick={handleToggleForm}>{showForm ? 'Cancel' : (editingId ? 'Edit' : '+ Add')}</button></div>
        {showForm && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div><label>Year</label><input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Type</label><select name="responsibility_type" value={formData.responsibility_type} onChange={handleChange} style={{ width: '100%', padding: 10 }}><option value="Administrative">Administrative</option><option value="Committee">Committee</option><option value="Examination">Examination</option><option value="Admission">Admission</option><option value="Student Welfare">Student Welfare</option><option value="Other">Other</option></select></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Position/Role</label><input type="text" name="position" value={formData.position} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Tenure From</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div><label>Tenure To</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} required style={{ width: '100%', padding: 10 }} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: 10, minHeight: 80 }} /></div>
                        <div><label>Proof</label><input type="file" onChange={handleFileChange} style={{ width: '100%', padding: 10 }} /></div>
                    </div>
                    <button type="submit" className="btn-toggle" style={{ marginTop: 20, width: "100%" }}>Save Role</button>
                </form>
            </div>
        )}

        <div className="id-badge-grid">
          {filteredEntries.map(entry => {
              const bgUrl = entry.supporting_image ? (entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`) : null;
              
              const getIcon = (type) => {
                  const t = type.toLowerCase();
                  if(t.includes('admin')) return '💼';
                  if(t.includes('committee')) return '🏛️';
                  if(t.includes('exam')) return '📝';
                  if(t.includes('welfare')) return '🤝';
                  return '🏢';
              };

              return (
              <div key={entry.id} className="id-badge">
                  <div className="id-header">
                      <span className="id-type">{entry.responsibility_type}</span>
                      <div className="id-avatar-wrapper">
                          {bgUrl ? (
                              <img src={bgUrl} alt="Proof" className="id-avatar-img" />
                          ) : (
                              <span className="id-avatar-icon">{getIcon(entry.responsibility_type)}</span>
                          )}
                      </div>
                  </div>
                  
                  <div className="id-body">
                      <h3 className="id-position">{entry.position}</h3>
                      {entry.description && <p className="id-desc">{entry.description}</p>}
                      
                      <div className="id-meta-grid">
                          <div className="id-meta-item">
                              <span className="id-meta-lbl">Academic Year</span>
                              <span className="id-meta-val">{entry.academic_year}</span>
                          </div>
                          <div className="id-meta-item">
                              <span className="id-meta-lbl">Duration</span>
                              <span className="id-meta-val">{entry.from_date}</span>
                          </div>
                      </div>
                      
                      <div className="id-actions">
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

export default InstitutionalResponsibility;
