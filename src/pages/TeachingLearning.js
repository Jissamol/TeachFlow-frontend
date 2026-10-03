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
    description: "",
    supporting_image: null
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

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, supporting_image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const url = editingId 
      ? `http://127.0.0.1:8000/api/pbas/teaching/${editingId}/`
      : "http://127.0.0.1:8000/api/pbas/teaching/";
    
    const data = new FormData();
    data.append("academic_year", formData.academic_year);
    data.append("course_name", formData.course_name);
    data.append("course_level", formData.course_level);
    data.append("mode_of_teaching", formData.mode_of_teaching);
    data.append("classes_assigned", parseInt(formData.classes_assigned) || 0);
    data.append("classes_taught", parseInt(formData.classes_taught) || 0);
    if (formData.from_date) data.append("from_date", formData.from_date);
    if (formData.to_date) data.append("to_date", formData.to_date);
    if (formData.description) data.append("description", formData.description);
    if (formData.supporting_image instanceof File) data.append("supporting_image", formData.supporting_image);

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        setMsg({ type: "success", text: "Synced with Database!" });
        setFormData({ academic_year: "2024-2025", course_name: "", course_level: "UG", mode_of_teaching: "Lecture", classes_assigned: "", classes_taught: "", from_date: "", to_date: "", description: "", supporting_image: null });
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
    setFormData({ ...entry, supporting_image: null, from_date: entry.from_date || "", to_date: entry.to_date || "" });
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
        description: "",
        supporting_image: null
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
  }).sort((a, b) => new Date(b.from_date) - new Date(a.from_date));

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
        
        /* New Course Cards Masonry Styling */
        .course-grid { column-count: auto; column-width: 320px; column-gap: 24px; }
        .course-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(26,77,46,0.03); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; break-inside: avoid; margin-bottom: 24px; }
        .course-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(26,77,46,0.08); }
        .course-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .course-level-badge { background: #e8f5e9; color: #1a4d2e; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; border: 1px solid rgba(26,77,46,0.1); }
        .course-actions { display: flex; gap: 8px; }
        .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.9rem; padding: 6px; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; }
        .icon-btn:hover { background: white; }
        .icon-btn.edit:hover { color: #1a4d2e; border-color: #1a4d2e; }
        .icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; }
        .course-name { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; line-height: 1.3; font-family: 'Playfair Display', serif; }
        .course-meta { display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #64748b; margin-bottom: 24px; font-weight: 500; }
        .course-meta-item { display: flex; align-items: center; gap: 8px; }
        .course-progress { margin-top: auto; padding-top: 20px; border-top: 1px dashed #e2e8f0; }
        .progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 10px; }
        .progress-bar-bg { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #1a4d2e, #4ade80); border-radius: 4px; transition: width 1s ease; }
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
                        <div className="filter-group"><label className="filter-label">Mode</label><select name="mode_of_teaching" value={formData.mode_of_teaching} onChange={handleChange} className="filter-input"><option value="Lecture">Lecture</option><option value="Practical">Practical</option><option value="Tutorial">Tutorial</option></select></div>
                        <div className="filter-group"><label className="filter-label">From Date</label><input type="date" name="from_date" value={formData.from_date} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">To Date</label><input type="date" name="to_date" value={formData.to_date} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Assigned</label><input type="number" name="classes_assigned" value={formData.classes_assigned} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group"><label className="filter-label">Taught</label><input type="number" name="classes_taught" value={formData.classes_taught} onChange={handleChange} className="filter-input" required /></div>
                        <div className="filter-group" style={{ gridColumn: "span 2" }}><label className="filter-label">Proof (Optional)</label><input type="file" onChange={handleFileChange} className="filter-input" /></div>
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

        <div className="course-grid">
          {filteredEntries.map(entry => {
            const assigned = parseInt(entry.classes_assigned) || 0;
            const taught = parseInt(entry.classes_taught) || 0;
            const progress = assigned > 0 ? (taught / assigned) * 100 : 0;
            
            return (
              <div key={entry.id} className="course-card">
                  <div className="course-card-header">
                      <span className="course-level-badge">{entry.course_level}</span>
                      <div className="course-actions">
                          <button onClick={() => handleEdit(entry)} className="icon-btn edit" title="Edit">✎</button>
                          <button onClick={() => deleteEntry(entry.id)} className="icon-btn delete" title="Delete">🗑</button>
                      </div>
                  </div>
                  
                  <h3 className="course-name">{entry.course_name}</h3>
                  
                  <div className="course-meta">
                      <div className="course-meta-item">
                          <span>📅</span> {entry.academic_year}
                      </div>
                      <div className="course-meta-item">
                          <span>⏱</span> {entry.from_date} to {entry.to_date}
                      </div>
                      <div className="course-meta-item">
                          <span>👨‍🏫</span> {entry.mode_of_teaching || 'Lecture'}
                      </div>
                  </div>
                  
                  {entry.supporting_image && (
                      <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', height: '140px' }}>
                          <img src={entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                  )}
                  
                  <div className="course-progress">
                      <div className="progress-labels">
                          <span>Classes Completed</span>
                          <span style={{ color: '#1a4d2e' }}>{taught} / {assigned}</span>
                      </div>
                      <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }}></div>
                      </div>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TeachingLearning;
