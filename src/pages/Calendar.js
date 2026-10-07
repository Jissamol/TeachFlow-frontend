import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Calendar.css";

const CATEGORIES = [
  { key: "All", label: "All Activities", icon: "🗓️" },
  { key: "Workshop", label: "🟢 Workshop", icon: "🟢", color: "#10b981", bgLight: "rgba(16, 185, 129, 0.12)" },
  { key: "Conference", label: "🔵 Conference", icon: "🔵", color: "#3b82f6", bgLight: "rgba(59, 130, 246, 0.12)" },
  { key: "Lecture", label: "🟣 Lecture", icon: "🟣", color: "#a855f7", bgLight: "rgba(168, 85, 247, 0.12)" },
  { key: "Research", label: "🟠 Research", icon: "🟠", color: "#f97316", bgLight: "rgba(249, 115, 22, 0.12)" },
  { key: "Institutional Duty", label: "🔴 Institutional Duty", icon: "🔴", color: "#ef4444", bgLight: "rgba(239, 68, 68, 0.12)" },
];

const INITIAL_FALLBACK_EVENTS = [
  {
    id: "init-1",
    category: "Institutional Duty",
    category_label: "🔴 Institutional Duty",
    color: "#ef4444",
    bg_light: "rgba(239, 68, 68, 0.15)",
    title: "IQAC Quality Coordinator & Audit",
    date: "2026-10-02",
    score: 5.0,
    description: "Internal quality audit and documentation review for NAAC accreditation standards.",
    type: "Institutional Responsibility",
    url: "/pbas/institutional",
    academic_year: "2026-2027"
  },
  {
    id: "init-2",
    category: "Lecture",
    category_label: "🟣 Lecture",
    color: "#a855f7",
    bg_light: "rgba(168, 85, 247, 0.15)",
    title: "Advanced Distributed Systems Lecture",
    date: "2026-10-05",
    score: 10.0,
    description: "Special guest lecture series on consensus algorithms (Raft & Paxos).",
    type: "Teaching & Learning",
    url: "/pbas/teaching",
    academic_year: "2026-2027"
  },
  {
    id: "init-3",
    category: "Workshop",
    category_label: "🟢 Workshop",
    color: "#10b981",
    bg_light: "rgba(16, 185, 129, 0.15)",
    title: "AI & Data Analytics Hands-on Workshop",
    date: "2026-10-08",
    score: 6.0,
    description: "Hands-on workshop for undergraduate students on Machine Learning and Data Science tools.",
    type: "Student Support",
    url: "/pbas/student-support",
    academic_year: "2026-2027"
  },
  {
    id: "init-4",
    category: "Conference",
    category_label: "🔵 Conference",
    color: "#3b82f6",
    bg_light: "rgba(59, 130, 246, 0.15)",
    title: "IEEE International Conference Paper Presentation",
    date: "2026-10-12",
    score: 15.0,
    description: "Presented research paper on lightweight neural network deployment for edge devices.",
    type: "Academic Contribution",
    url: "/pbas/academic",
    academic_year: "2026-2027"
  },
  {
    id: "init-5",
    category: "Research",
    category_label: "🟠 Research",
    color: "#f97316",
    bg_light: "rgba(249, 115, 22, 0.15)",
    title: "Scalable Federated Learning (Journal Publication)",
    date: "2026-10-16",
    score: 20.0,
    description: "Peer-reviewed journal publication in IEEE TKDE on privacy-preserving ML models.",
    type: "Research",
    url: "/pbas/research",
    academic_year: "2026-2027"
  },
  {
    id: "init-6",
    category: "Workshop",
    category_label: "🟢 Workshop",
    color: "#10b981",
    bg_light: "rgba(16, 185, 129, 0.15)",
    title: "Student Career Guidance & Mentorship Seminar",
    date: "2026-10-20",
    score: 4.0,
    description: "Interactive session on higher education, placements, and research career pathways.",
    type: "Student Support",
    url: "/pbas/student-support",
    academic_year: "2026-2027"
  },
  {
    id: "init-7",
    category: "Institutional Duty",
    category_label: "🔴 Institutional Duty",
    color: "#ef4444",
    bg_light: "rgba(239, 68, 68, 0.15)",
    title: "Chief Superintendent End-Sem Exam Duty",
    date: "2026-10-23",
    score: 5.0,
    description: "Overseeing university end-semester examination logistics and valuation center.",
    type: "Institutional Responsibility",
    url: "/pbas/institutional",
    academic_year: "2026-2027"
  },
  {
    id: "init-8",
    category: "Lecture",
    category_label: "🟣 Lecture",
    color: "#a855f7",
    bg_light: "rgba(168, 85, 247, 0.15)",
    title: "Invited Keynote Talk on Deep Reinforcement Learning",
    date: "2026-10-27",
    score: 10.0,
    description: "Special session on Reinforcement Learning architectures for AI faculty FDP.",
    type: "Academic Contribution",
    url: "/pbas/academic",
    academic_year: "2026-2027"
  },
  {
    id: "init-9",
    category: "Conference",
    category_label: "🔵 Conference",
    color: "#3b82f6",
    bg_light: "rgba(59, 130, 246, 0.15)",
    title: "National Cyber Security Summit 2026 Keynote",
    date: "2026-10-29",
    score: 12.0,
    description: "Delivered keynote speech on modern encryption standards and privacy models.",
    type: "Academic Contribution",
    url: "/pbas/academic",
    academic_year: "2026-2027"
  }
];

const Calendar = () => {
  const navigate = useNavigate();
  // Default to October 2026 as per user requirement
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026 (month 9 is Oct)
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState(INITIAL_FALLBACK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityDate, setNewActivityDate] = useState("2026-10-15");

  const [formData, setFormData] = useState({
    title: "",
    category: "Workshop",
    date: "2026-10-15",
    description: "",
    academic_year: "2026-2027"
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/calendar/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch calendar events, using fallback", err);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToCurrent = () => {
    setCurrentDate(new Date(2026, 9, 1)); // October 2026
  };

  const handleOpenAddModal = (dateStr) => {
    const formatted = dateStr || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-15`;
    setNewActivityDate(formatted);
    setFormData({
      title: "",
      category: "Workshop",
      date: formatted,
      description: "",
      academic_year: "2026-2027"
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    // Color mapping
    const colorMap = {
      Workshop: "#10b981",
      Conference: "#3b82f6",
      Lecture: "#a855f7",
      Research: "#f97316",
      "Institutional Duty": "#ef4444"
    };

    const newEvt = {
      id: `local-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      category_label: `${CATEGORIES.find(c => c.key === formData.category)?.icon || '🟢'} ${formData.category}`,
      color: colorMap[formData.category] || "#10b981",
      bg_light: colorMap[formData.category] + "25",
      date: formData.date,
      score: 5.0,
      description: formData.description || "Faculty Academic Activity",
      type: formData.category,
      academic_year: formData.academic_year,
      url: formData.category === 'Workshop' ? '/pbas/student-support' : formData.category === 'Research' ? '/pbas/research' : '/pbas/academic'
    };

    setEvents(prev => [...prev, newEvt]);
    setShowAddModal(false);

    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/api/pbas/calendar/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
        fetchEvents();
      } catch (err) {}
    }
  };

  // Month grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // First day of month (0 = Sun, 1 = Mon, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month padding days
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dayNum,
      isCurrentMonth: false,
      dateStr
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = year === 2026 && month === 9 && d === 7; // Oct 7, 2026
    calendarDays.push({
      dayNum: d,
      isCurrentMonth: true,
      isToday,
      dateStr
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: false,
      dateStr
    });
  }

  // Filter events
  const filteredEvents = events.filter(e => {
    if (selectedCategory === "All") return true;
    return e.category === selectedCategory;
  });

  // Calculate stats for current month
  const currentMonthEvents = events.filter(e => {
    const [eY, eM] = e.date.split("-").map(Number);
    return eY === year && eM === (month + 1);
  });

  const totalMonthlyScore = currentMonthEvents.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);

  const categoryCounts = {
    Workshop: currentMonthEvents.filter(e => e.category === "Workshop").length,
    Conference: currentMonthEvents.filter(e => e.category === "Conference").length,
    Lecture: currentMonthEvents.filter(e => e.category === "Lecture").length,
    Research: currentMonthEvents.filter(e => e.category === "Research").length,
    "Institutional Duty": currentMonthEvents.filter(e => e.category === "Institutional Duty").length,
  };

  return (
    <div className="calendar-container">
      {/* Header Card */}
      <div className="calendar-header-card">
        <div className="calendar-title-group">
          <h1>
            <span>📅</span> Academic Activity Calendar
          </h1>
          <p>Schedule, track, and manage all academic & PBAS activities for performance appraisal.</p>
        </div>

        <div className="calendar-controls">
          <button className="month-nav-btn" onClick={prevMonth}>
            ‹ Prev
          </button>
          <div className="current-month-display">
            {monthNames[month]} {year}
          </div>
          <button className="month-nav-btn" onClick={nextMonth}>
            Next ›
          </button>
          <button className="today-btn" onClick={resetToCurrent}>
            October 2026
          </button>
          <button className="add-event-btn" onClick={() => handleOpenAddModal(null)}>
            <span>➕</span> Add Activity
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="calendar-filter-bar">
        {CATEGORIES.map(cat => {
          const count = cat.key === "All" 
            ? currentMonthEvents.length 
            : (categoryCounts[cat.key] || 0);
          return (
            <button
              key={cat.key}
              className={`filter-pill ${selectedCategory === cat.key ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label.replace(/^[🟢🔵🟣🟠🔴]\s*/, "")}</span>
              <span className="badge-count" style={{
                background: selectedCategory === cat.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                marginLeft: '4px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div className="calendar-layout-grid">
        {/* Left Calendar Grid Card */}
        <div className="calendar-card">
          {/* Weekday Headers: Mon Tue Wed Thu Fri Sat Sun */}
          <div className="weekdays-grid">
            <div className="weekday-header">Mon</div>
            <div className="weekday-header">Tue</div>
            <div className="weekday-header">Wed</div>
            <div className="weekday-header">Thu</div>
            <div className="weekday-header">Fri</div>
            <div className="weekday-header" style={{ color: '#94a3b8' }}>Sat</div>
            <div className="weekday-header" style={{ color: '#94a3b8' }}>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="days-grid">
            {calendarDays.map((cell, idx) => {
              const dayEvts = filteredEvents.filter(e => e.date === cell.dateStr);

              return (
                <div
                  key={idx}
                  className={`day-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${cell.isToday ? "is-today" : ""}`}
                  onClick={(e) => {
                    // If target was not an event pill, offer quick add
                    if (!e.target.closest('.event-pill')) {
                      handleOpenAddModal(cell.dateStr);
                    }
                  }}
                >
                  <div className="day-cell-header">
                    <span className="day-number">{cell.dayNum}</span>
                    <span className="quick-add-icon">➕</span>
                  </div>

                  <div className="day-events-list">
                    {dayEvts.map(evt => (
                      <div
                        key={evt.id}
                        className="event-pill"
                        style={{
                          backgroundColor: evt.bg_light || "rgba(99, 102, 241, 0.15)",
                          borderLeftColor: evt.color || "#6366f1",
                          color: "#1e293b"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        title={`${evt.category_label || evt.category}: ${evt.title}`}
                      >
                        <span className="event-pill-title">
                          {evt.category === "Workshop" && "🟢 "}
                          {evt.category === "Conference" && "🔵 "}
                          {evt.category === "Lecture" && "🟣 "}
                          {evt.category === "Research" && "🟠 "}
                          {evt.category === "Institutional Duty" && "🔴 "}
                          {evt.title}
                        </span>
                        {evt.score > 0 && (
                          <span className="event-pill-score">+{evt.score}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Stats & Upcoming List */}
        <div className="calendar-sidebar">
          {/* Monthly Overview Card */}
          <div className="stat-card">
            <h3><span>📊</span> {monthNames[month]} Summary</h3>
            <div className="stat-row">
              <span className="stat-label">Total Activities</span>
              <span className="stat-value">{currentMonthEvents.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">PBAS Points Earned</span>
              <span className="stat-value" style={{ color: '#10b981' }}>+{totalMonthlyScore.toFixed(1)} pts</span>
            </div>
            
            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div className="stat-label" style={{ marginBottom: '10px', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                Activity Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🟢 Workshops</span>
                  <strong>{categoryCounts.Workshop}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🔵 Conferences</span>
                  <strong>{categoryCounts.Conference}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🟣 Lectures</span>
                  <strong>{categoryCounts.Lecture}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🟠 Research</span>
                  <strong>{categoryCounts.Research}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🔴 Institutional Duties</span>
                  <strong>{categoryCounts["Institutional Duty"]}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Box */}
          <div className="stat-card">
            <h3><span>🔔</span> Upcoming Activities</h3>
            <div className="upcoming-events-list">
              {currentMonthEvents.slice(0, 5).map(evt => (
                <div 
                  key={evt.id} 
                  className="upcoming-event-item"
                  style={{ borderLeftColor: evt.color || "#6366f1" }}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <div className="upcoming-event-title">{evt.title}</div>
                  <div className="upcoming-event-meta">
                    <span>{evt.category_label || evt.category}</span>
                    <span>{evt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>
              ✕
            </button>

            <div 
              className="event-detail-badge"
              style={{
                backgroundColor: selectedEvent.bg_light || "rgba(99, 102, 241, 0.15)",
                color: selectedEvent.color || "#6366f1"
              }}
            >
              {selectedEvent.category === "Workshop" && "🟢 Workshop"}
              {selectedEvent.category === "Conference" && "🔵 Conference"}
              {selectedEvent.category === "Lecture" && "🟣 Lecture"}
              {selectedEvent.category === "Research" && "🟠 Research"}
              {selectedEvent.category === "Institutional Duty" && "🔴 Institutional Duty"}
            </div>

            <h2 className="event-detail-title">{selectedEvent.title}</h2>

            <div className="event-detail-grid">
              <div>
                <div className="detail-item-label">Date</div>
                <div className="detail-item-val">📅 {selectedEvent.date}</div>
              </div>
              <div>
                <div className="detail-item-label">PBAS Score</div>
                <div className="detail-item-val" style={{ color: '#10b981' }}>
                  +{selectedEvent.score || 5.0} Points
                </div>
              </div>
              <div>
                <div className="detail-item-label">Academic Year</div>
                <div className="detail-item-val">{selectedEvent.academic_year || "2026-2027"}</div>
              </div>
              <div>
                <div className="detail-item-label">Module Type</div>
                <div className="detail-item-val">{selectedEvent.type || selectedEvent.category}</div>
              </div>
            </div>

            <div className="event-detail-desc">
              <strong>Description & Notes:</strong>
              <p style={{ margin: "8px 0 0 0" }}>
                {selectedEvent.description || "No specific details provided for this academic activity."}
              </p>
            </div>

            <div className="modal-actions">
              {selectedEvent.url && (
                <button 
                  className="modal-primary-btn"
                  onClick={() => {
                    const url = selectedEvent.url;
                    setSelectedEvent(null);
                    navigate(url);
                  }}
                >
                  View Activity Details →
                </button>
              )}
              <button 
                className="modal-secondary-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD ACTIVITY MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
              ✕
            </button>

            <h2 style={{ margin: "0 0 16px 0", fontSize: "1.3rem", fontWeight: 700 }}>
              ➕ Add Academic Activity
            </h2>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Activity Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="Workshop">🟢 Workshop</option>
                  <option value="Conference">🔵 Conference</option>
                  <option value="Lecture">🟣 Lecture</option>
                  <option value="Research">🟠 Research</option>
                  <option value="Institutional Duty">🔴 Institutional Duty</option>
                </select>
              </div>

              <div className="form-group">
                <label>Activity Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Guest Lecture on Machine Learning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description & Objectives</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter details about this activity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="modal-primary-btn">
                  Save Activity
                </button>
                <button 
                  type="button" 
                  className="modal-secondary-btn" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
