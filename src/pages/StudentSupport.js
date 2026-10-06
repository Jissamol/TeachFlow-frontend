import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentSupport = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    academic_year: "2024-2025",
    activity_name: "Remedial Coaching",
    description: "",
    target_audience: "1st years",
    hours_spent: "5",
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
        activity_name: "Remedial Coaching",
        description: "",
        target_audience: "1st years",
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
    if (!window.confirm("Are you sure you want to delete this activity record?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/student-support/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchEntries();
    } catch (err) {}
  };

  const uniqueYears = ["All", ...new Set(entries.map(e => e.academic_year))];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (entry.target_audience && entry.target_audience.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filterYear === "All" || entry.academic_year === filterYear;
    return matchesSearch && matchesYear;
  }).sort((a, b) => new Date(b.from_date || 0) - new Date(a.from_date || 0));

  const totalHours = entries.reduce((acc, curr) => acc + (parseInt(curr.hours_spent) || 0), 0);
  const withProofCount = entries.filter(e => !!e.supporting_image).length;

  return (
    <>
      <style>{`
        .pbas-container { padding: 40px 30px; max-width: 1400px; margin: 0 auto; font-family: 'Outfit', 'Work Sans', sans-serif; background: #faf8f5; min-height: 100vh; }
        
        .pbas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .pbas-title-box h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #1a4d2e; font-weight: 800; margin: 0; }
        .pbas-subtitle { font-size: 0.95rem; color: #64748b; margin-top: 4px; }
        
        .btn-toggle { background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; border: none; padding: 12px 26px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 14px rgba(26,77,46,0.25); display: flex; align-items: center; gap: 8px; }
        .btn-toggle:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,77,46,0.35); background: linear-gradient(135deg, #143e24 0%, #245740 100%); }

        /* Statistics Cards Banner */
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 22px 24px; border-radius: 18px; border: 1px solid rgba(26,77,46,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; align-items: center; gap: 18px; transition: transform 0.2s; }
        .summary-card:hover { transform: translateY(-3px); }
        .summary-icon-box { width: 52px; height: 52px; border-radius: 14px; background: #e8f5e9; color: #1a4d2e; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
        .summary-val { font-size: 1.9rem; font-weight: 800; color: #1a4d2e; font-family: 'Playfair Display', serif; line-height: 1; }
        .summary-label { color: #64748b; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

        /* Filter Controls */
        .filter-bar { background: white; padding: 18px 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; gap: 20px; align-items: center; margin-bottom: 30px; flex-wrap: wrap; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .search-box { flex: 1; min-width: 250px; position: relative; }
        .search-input { width: 100%; padding: 10px 16px 10px 42px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: #1a4d2e; box-shadow: 0 0 0 3px rgba(26,77,46,0.1); }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1rem; }
        .filter-select { padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; color: #1e293b; font-weight: 600; outline: none; background: white; cursor: pointer; }

        /* Form Card */
        .form-card { background: white; padding: 32px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .form-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #1a4d2e; margin: 0 0 20px 0; font-weight: 700; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-input { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; outline: none; transition: 0.2s; font-family: inherit; }
        .form-input:focus { border-color: #1a4d2e; box-shadow: 0 0 0 3px rgba(26,77,46,0.1); }

        /* Compact natural card grid - align-items: start ensures NO empty height gaps */
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 28px; align-items: start; }
        
        .metric-card { 
          background: white; 
          border-radius: 20px; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
          display: flex; 
          flex-direction: column; 
          padding: 24px;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; 
          position: relative; 
        }
        .metric-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 16px 35px rgba(26,77,46,0.09); 
          border-color: rgba(26,77,46,0.25); 
        }

        /* Top Header inside Card */
        .card-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .metric-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1e293b;
          font-family: 'Playfair Display', serif;
          line-height: 1.3;
          margin: 0 0 8px 0;
        }

        .target-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        /* Hours Circle Badge */
        .metric-hours-badge {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(26,77,46,0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #1a4d2e;
          transition: transform 0.3s ease;
        }
        .metric-card:hover .metric-hours-badge {
          transform: scale(1.06);
        }
        .hours-val { font-size: 1.5rem; font-weight: 800; line-height: 1; font-family: 'Playfair Display', serif; }
        .hours-lbl { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; opacity: 0.85; margin-top: 1px; }

        /* Meta details list */
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #475569;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }
        .meta-icon { font-size: 1.1rem; color: #1a4d2e; flex-shrink: 0; }

        .card-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.45;
          background: #faf8f5;
          padding: 10px 14px;
          border-radius: 10px;
          border-left: 3px solid #1a4d2e;
          margin-bottom: 14px;
        }

        /* Proof Media Thumbnail Box (Only rendered when proof exists) */
        .proof-media-box {
          border-radius: 14px;
          overflow: hidden;
          height: 160px;
          position: relative;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
          cursor: pointer;
        }
        .proof-media-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .proof-media-box:hover img {
          transform: scale(1.05);
        }
        .proof-media-tag {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Compact Badge indicator for imageless records */
        .no-proof-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
          background: #f1f5f9;
          padding: 5px 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          width: fit-content;
        }

        /* Card Footer Actions (Sits directly under content with no empty gap) */
        .card-footer {
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 12px;
        }

        .btn-edit {
          flex: 1;
          color: #1a4d2e;
          font-weight: 700;
          background: #e8f5e9;
          border: 1px solid rgba(26,77,46,0.15);
          cursor: pointer;
          padding: 9px;
          border-radius: 10px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-edit:hover { background: #c8e6c9; transform: translateY(-1px); }

        .btn-delete {
          flex: 1;
          color: #dc2626;
          font-weight: 700;
          background: #fef2f2;
          border: 1px solid rgba(220,38,38,0.15);
          cursor: pointer;
          padding: 9px;
          border-radius: 10px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-delete:hover { background: #fee2e2; transform: translateY(-1px); }

        /* Lightbox Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(5px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-img-box {
          max-width: 90vw;
          max-height: 85vh;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        .modal-img-box img {
          max-width: 100%;
          max-height: 80vh;
          display: block;
          object-fit: contain;
        }
        .modal-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="pbas-container">
        {/* Page Header */}
        <div className="pbas-header">
          <div className="pbas-title-box">
            <h1>Mentorship & Student Support</h1>
            <div className="pbas-subtitle">Track & document remedial coaching, counseling, and guidance activities</div>
          </div>
          <button className="btn-toggle" onClick={handleToggleForm}>
            {showForm ? '✕ Close Form' : (editingId ? '✎ Edit Activity' : '+ Add New Activity')}
          </button>
        </div>

        {/* Top Summary Statistics Banner */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon-box">📚</div>
            <div>
              <div className="summary-val">{entries.length}</div>
              <div className="summary-label">Total Activities</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon-box">⏱️</div>
            <div>
              <div className="summary-val">{totalHours}</div>
              <div className="summary-label">Total Hours</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon-box">🎯</div>
            <div>
              <div className="summary-val">{[...new Set(entries.map(e => e.target_audience).filter(Boolean))].length || 1}</div>
              <div className="summary-label">Target Groups</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon-box">📷</div>
            <div>
              <div className="summary-val">{withProofCount}</div>
              <div className="summary-label">Proofs Attached</div>
            </div>
          </div>
        </div>

        {/* Form Collapsible Box */}
        {showForm && (
          <div className="form-card">
            <h2 className="form-title">{editingId ? 'Edit Mentorship Record' : 'Record New Mentorship Activity'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} className="form-input" placeholder="e.g. 2024-2025" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Activity Name</label>
                  <input type="text" name="activity_name" value={formData.activity_name} onChange={handleChange} className="form-input" placeholder="e.g. Remedial Coaching" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange} className="form-input" placeholder="e.g. 1st years" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours Spent</label>
                  <input type="number" name="hours_spent" value={formData.hours_spent} onChange={handleChange} className="form-input" placeholder="e.g. 5" required min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input type="date" name="from_date" value={formData.from_date} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input type="date" name="to_date" value={formData.to_date} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Supporting Proof (Image / Document)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description / Summary (Optional)</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" style={{ minHeight: 80 }} placeholder="Brief overview of topics covered or student progress..." />
                </div>
              </div>
              <button type="submit" className="btn-toggle" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Saving Record...' : (editingId ? '✓ Update Activity Record' : '✓ Save Activity Record')}
              </button>
            </form>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by activity name or target group..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Filter Year:</span>
            <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Metric Cards Grid */}
        {filteredEntries.length === 0 ? (
          <div style={{ background: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No Student Support Activities Found</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Click "+ Add New Activity" above to record your mentorship or remedial coaching work.</p>
          </div>
        ) : (
          <div className="metric-grid">
            {filteredEntries.map(entry => {
              const imageUrl = entry.supporting_image 
                ? (entry.supporting_image.startsWith('http') ? entry.supporting_image : `http://127.0.0.1:8000${entry.supporting_image}`)
                : null;

              return (
                <div key={entry.id} className="metric-card">
                  {/* Top Header Row with Title & Hours Circle */}
                  <div className="card-header-top">
                    <div>
                      <h3 className="metric-title">{entry.activity_name}</h3>
                      {entry.target_audience && (
                        <div className="target-tag">
                          <span>🎯</span> Target: {entry.target_audience}
                        </div>
                      )}
                    </div>

                    <div className="metric-hours-badge">
                      <span className="hours-val">{entry.hours_spent || 0}</span>
                      <span className="hours-lbl">Hrs</span>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="meta-list">
                    <div className="meta-row">
                      <span className="meta-icon">🗓️</span>
                      <div><strong>Year:</strong> {entry.academic_year}</div>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">⏱️</span>
                      <div><strong>Period:</strong> {entry.from_date || 'N/A'} to {entry.to_date || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Description snippet if present */}
                  {entry.description && (
                    <div className="card-desc">
                      {entry.description}
                    </div>
                  )}

                  {/* Proof Attachment Image (Rendered cleanly ONLY when proof exists) */}
                  {imageUrl ? (
                    <div className="proof-media-box" onClick={() => setPreviewImage(imageUrl)} title="Click to view full image">
                      <img src={imageUrl} alt={entry.activity_name} />
                      <div className="proof-media-tag">
                        <span>📷</span> Click to Expand Proof
                      </div>
                    </div>
                  ) : (
                    <div className="no-proof-chip">
                      <span>📄</span> Activity Record (No Image Attached)
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="card-footer">
                    <button onClick={() => handleEdit(entry)} className="btn-edit">
                      <span>✎</span> Edit
                    </button>
                    <button onClick={() => deleteEntry(entry.id)} className="btn-delete">
                      <span>🗑</span> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Image Preview Lightbox */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
            <div className="modal-img-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setPreviewImage(null)}>✕</button>
              <img src={previewImage} alt="Activity Proof" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentSupport;


