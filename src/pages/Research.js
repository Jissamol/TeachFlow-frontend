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

  const filteredEntries = entries.filter(entry => entry.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
        .table-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
        .pbas-table { width: 100%; border-collapse: collapse; }
        .pbas-table th { background: #f8fafc; color: #64748b; padding: 16px; text-align: left; }
        .pbas-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        .btn-edit { color: #166534; font-weight: 700; background: none; border: none; cursor: pointer; margin-right: 15px; }
        .btn-delete { color: #991b1b; font-weight: 700; background: none; border: none; cursor: pointer; }
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

        <div className="table-card">
          <table className="pbas-table">
            <thead>
              <tr><th>Year</th><th>Period</th><th>Type</th><th>Title</th><th>Proof</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.academic_year}</td>
                  <td><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{entry.from_date} to {entry.to_date}</div></td>
                  <td><span style={{ padding: "4px 8px", background: "#f0fdf4", color: "#166534", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{entry.research_type}</span></td>
                  <td style={{ fontWeight: 600 }}>{entry.title}</td>
                  <td>{entry.supporting_image ? "✅" : "❌"}</td>
                  <td>
                      <button onClick={() => handleEdit(entry)} className="btn-edit">Edit</button>
                      <button onClick={() => deleteEntry(entry.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Research;
