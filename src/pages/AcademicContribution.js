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

  const filteredEntries = entries.filter(entry => entry.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <style>{`
        .pbas-container { padding: 40px 20px; max-width: 1400px; margin: 0 auto; font-family: 'Work Sans', sans-serif; background: #faf8f5; min-height: 100vh; }
        .pbas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .pbas-title { font-family: 'Crimson Pro', serif; font-size: 2.2rem; color: #1a4d2e; font-weight: 700; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .table-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
        .pbas-table { width: 100%; border-collapse: collapse; }
        .pbas-table th { background: #f8fafc; color: #64748b; padding: 16px; text-align: left; }
        .pbas-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        .btn-edit { color: #166534; font-weight: 700; background: none; border: none; cursor: pointer; margin-right: 15px; }
        .btn-delete { color: #991b1b; font-weight: 700; background: none; border: none; cursor: pointer; }
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

        <div className="table-card">
          <table className="pbas-table">
            <thead>
              <tr><th>Year</th><th>Period</th><th>Type</th><th>Achievement</th><th>Proof</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.academic_year}</td>
                  <td><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{entry.from_date} to {entry.to_date}</div></td>
                  <td><span style={{ padding: "4px 8px", background: "#fef3c7", color: "#92400e", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>{entry.contribution_type}</span></td>
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

export default AcademicContribution;
