import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TeachingLearning = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    course_name: "",
    course_level: "UG",
    mode_of_teaching: "Lecture",
    classes_assigned: "",
    classes_taught: "",
    from_date: "",
    to_date: "",
    description: ""
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/"); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/teaching/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setEntries(await res.json());
    } catch (err) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const url = editingId 
      ? `http://127.0.0.1:8000/api/pbas/teaching/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/teaching/";
    
    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            ...formData,
            classes_assigned: parseInt(formData.classes_assigned) || 0,
            classes_taught: parseInt(formData.classes_taught) || 0,
            from_date: formData.from_date || null,
            to_date: formData.to_date || null,
            description: formData.description || ""
        })
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Synced with Database!" });
        setFormData({ academic_year: "2024-2025", course_name: "", course_level: "UG", mode_of_teaching: "Lecture", classes_assigned: "", classes_taught: "", from_date: "", to_date: "", description: "" });
        setShowForm(false); setEditingId(null); fetchEntries();
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/teaching/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEntries();
    } catch (err) {}
  };

  const handleEdit = (entry) => {
    setFormData({ ...entry, from_date: entry.from_date || "", to_date: entry.to_date || "" });
    setEditingId(entry.id); setShowForm(true);
  };

  const handleToggleForm = () => {
    if (!showForm) {
      setFormData({
        academic_year: "2024-2025",
        course_name: "",
        course_level: "UG",
        mode_of_teaching: "Lecture",
        classes_assigned: "",
        classes_taught: "",
        from_date: "",
        to_date: "",
        description: ""
      });
      setEditingId(null);
    }
    setShowForm(!showForm);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "All" || entry.academic_year === filterYear;
    const matchesLevel = filterLevel === "All" || entry.course_level === filterLevel;
    return matchesSearch && matchesYear && matchesLevel;
  });

  const uniqueYears = ["All", ...new Set(entries.map(e => e.academic_year))];

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
        .filter-section { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; gap: 15px; align-items: center; margin-bottom: 25px; flex-wrap: wrap; }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .filter-input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; min-width: 150px; }
        .btn-toggle { background: #1a4d2e; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .table-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
        .pbas-table { width: 100%; border-collapse: collapse; }
        .pbas-table th { background: #f8fafc; color: #64748b; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; padding: 16px; text-align: left; }
        .pbas-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 0.95rem; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #dcfce7; color: #166534; }
        .btn-edit { color: #166534; font-weight: 700; background: none; border: none; cursor: pointer; margin-right: 15px; }
        .btn-delete { color: #991b1b; font-weight: 700; background: none; border: none; cursor: pointer; }
      `}</style>
      
      <div className="pbas-container">
        <div className="pbas-header">
          <h1 className="pbas-title">Teaching Analytics</h1>
          <button className="btn-toggle" onClick={handleToggleForm}>
            {showForm ? 'Cancel' : (editingId ? 'Edit Entry' : '+ Add New Entry')}
          </button>
        </div>

        <div className="summary-grid">
            <div className="summary-card"><div className="summary-val">{entries.length}</div><div className="summary-label">Total Courses</div></div>
            <div className="summary-card"><div className="summary-val">{entries.reduce((acc, curr) => acc + (parseInt(curr.classes_taught) || 0), 0)}</div><div className="summary-label">Total Classes Taught</div></div>
            <div className="summary-card"><div className="summary-val">{[...new Set(entries.map(e => e.academic_year))].length}</div><div className="summary-label">Years of Record</div></div>
        </div>

        {showForm && (
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "30px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div className="filter-group"><label className="filter-label">Academic Year</label><input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Course Name</label><input type="text" name="course_name" value={formData.course_name} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Level</label><select name="course_level" value={formData.course_level} onChange={handleChange} className="filter-input"><option value="UG">Undergraduate</option><option value="PG">Postgraduate</option><option value="Other">Other</option></select></div>
                        <div className="filter-group"><label className="filter-label">From Date</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">To Date</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Assigned</label><input type="number" name="classes_assigned" value={formData.classes_assigned} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Taught</label><input type="number" name="classes_taught" value={formData.classes_taught} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group" style={{ gridColumn: "span 2" }}><label className="filter-label">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="filter-input" style={{ minHeight: "80px" }} placeholder="Briefly describe the course or your role..." /></div>
                    </div>
                    <button type="submit" className="btn-toggle" style={{ marginTop: "20px", width: "100%" }}>{loading ? 'Processing...' : 'Sync with Database'}</button>
                </form>
            </div>
        )}

        <div className="filter-section">
            <div className="filter-group" style={{ flex: 1 }}><label className="filter-label">Search Courses</label><input type="text" placeholder="Type course name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="filter-input" style={{ width: "100%" }} /></div>
            <div className="filter-group"><label className="filter-label">Academic Year</label><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="filter-input">{uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            <div className="filter-group"><label className="filter-label">Level</label><select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="filter-input"><option value="All">All Levels</option><option value="UG">UG</option><option value="PG">PG</option></select></div>
        </div>

        <div className="table-card">
          <table className="pbas-table">
            <thead>
              <tr><th>Year</th><th>Validity</th><th>Course</th><th>Level</th><th>Assigned</th><th>Taught</th><th style={{ textAlign: "right" }}>Action</th></tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td style={{ fontWeight: 600 }}>{entry.academic_year}</td>
                  <td><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{entry.from_date} to {entry.to_date}</div></td>
                  <td>{entry.course_name}</td>
                  <td><span className="badge">{entry.course_level}</span></td>
                  <td>{entry.classes_assigned}</td>
                  <td><span style={{ color: "#1a4d2e", fontWeight: 700 }}>{entry.classes_taught}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => handleEdit(entry)} className="btn-edit">Edit</button>
                    <button onClick={() => deleteEntry(entry.id)} className="btn-delete">Remove</button>
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

export default TeachingLearning;
