import React, { useState, useEffect } from "react";

const ScoringRulesConfig = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pbas/rules/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePointChange = (id, newPoints) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, points_per_unit: parseFloat(newPoints) || 0 } : r));
  };

  const saveRule = async (rule) => {
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pbas/rules/${rule.id}/`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rule)
      });
      if (res.ok) {
        setMsg(`✓ Rule updated for ${rule.activity_type}!`);
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .rules-container { padding: 40px 30px; background: #fdfcfb; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #0d2c1a; }
        .rules-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .rules-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: #1a4d2e; margin: 0; }
        
        .rule-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 24px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .rule-info { flex: 1; }
        .rule-type { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .rule-cat { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        
        .rule-input { width: 100px; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 800; text-align: center; font-size: 1rem; color: #1a4d2e; }
        .btn-save-rule { background: #1a4d2e; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; margin-left: 15px; }
        .btn-save-rule:hover { background: #123620; }
      `}</style>

      <div className="rules-container">
        <div className="rules-header">
          <div>
            <h1 className="rules-title">PBAS Scoring Rules Configuration</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              Customizable Institution Point Formula Settings
            </p>
          </div>
          {msg && <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 20px", borderRadius: "12px", fontWeight: "700" }}>{msg}</div>}
        </div>

        <div style={{ maxWidth: "900px" }}>
          {rules.map((rule) => (
            <div key={rule.id} className="rule-card">
              <div className="rule-info">
                <div className="rule-type">{rule.activity_type}</div>
                <div className="rule-cat">{rule.category} • {rule.is_per_hour ? "Multiplied by Hours / Classes" : "Fixed Points per Entry"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontWeight: "700", marginRight: "10px", fontSize: "0.9rem", color: "#64748b" }}>Points:</span>
                <input 
                  type="number" 
                  className="rule-input" 
                  value={rule.points_per_unit} 
                  onChange={(e) => handlePointChange(rule.id, e.target.value)} 
                />
                <button className="btn-save-rule" onClick={() => saveRule(rule)}>Save Rule</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ScoringRulesConfig;
