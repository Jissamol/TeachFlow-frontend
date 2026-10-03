import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, 
  LineChart, Line, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [moduleCounts, setModuleCounts] = useState({ teaching: 0, studentSupport: 0, research: 0, academic: 1, institutional: 0 });
  const [liveData, setLiveData] = useState(Array.from({ length: 30 }, (_, i) => ({ name: i, value: 40 + Math.random() * 20, s: 20 + Math.random() * 30 })));
  const [liveOffset, setLiveOffset] = useState(0);
  const [geoData, setGeoData] = useState([
    { x: 15, y: 35, z: 200, name: 'North Region' },
    { x: 35, y: 65, z: 400, name: 'South Hub' },
    { x: 50, y: 45, z: 300, name: 'Central Node' },
    { x: 75, y: 25, z: 150, name: 'East Sector' },
    { x: 80, y: 75, z: 250, name: 'West Wing' },
  ]);

  const [radarData] = useState([
    { subject: 'Teaching', A: 120, B: 110 },
    { subject: 'Research', A: 98, B: 130 },
    { subject: 'Service', A: 86, B: 130 },
    { subject: 'Admin', A: 99, B: 100 },
    { subject: 'Mentoring', A: 85, B: 90 },
    { subject: 'Grants', A: 65, B: 85 },
  ]);

  const [stackedData] = useState([
    { name: 'Mon', teaching: 40, research: 24 },
    { name: 'Tue', teaching: 30, research: 13 },
    { name: 'Wed', teaching: 20, research: 58 },
    { name: 'Thu', teaching: 27, research: 39 },
    { name: 'Fri', teaching: 18, research: 48 },
    { name: 'Sat', teaching: 23, research: 38 },
    { name: 'Sun', teaching: 34, research: 43 },
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
    fetchAllCounts();

    const interval = setInterval(() => {
        fetchAllCounts();
        setLiveOffset(prev => (prev + 1) % 100);
        setLiveData(prev => {
            const last = prev[prev.length - 1];
            const next = [...prev.slice(1), { 
                name: last.name + 1, 
                value: 30 + Math.random() * 40,
                s: 20 + Math.random() * 40
            }];
            return next;
        });
        setGeoData(prev => prev.map(item => ({
            ...item, 
            x: Math.max(5, Math.min(95, item.x + (Math.random() - 0.5) * 4)),
            y: Math.max(5, Math.min(95, item.y + (Math.random() - 0.5) * 4)),
            z: Math.max(100, Math.min(1000, item.z + (Math.random() - 0.5) * 100))
        })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllCounts = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const eps = [
      "teaching", "student-support", "research", "academic-contributions", "institutional-responsibilities"
    ];
    try {
      const results = await Promise.all(eps.map(e => 
        fetch(`http://127.0.0.1:8000/api/pbas/${e}/`, { headers: { "Authorization": `Bearer ${token}` }})
        .then(res => res.ok ? res.json() : [])
      ));
      setModuleCounts({
        teaching: results[0].length,
        studentSupport: results[1].length,
        research: results[2].length,
        academic: results[3].length,
        institutional: results[4].length
      });
    } catch (err) {}
  };

  const total = Object.values(moduleCounts).reduce((a, b) => a + b, 0);

  const gaugeData = (val, max) => {
      // Add a tiny fluctuation to the "live" gauge so it moves even if val is static
      const smoothVal = val + Math.sin(liveOffset * 0.2) * 0.1;
      return [
        { name: 'value', value: Math.max(0, smoothVal), fill: '#1a4d2e' },
        { name: 'rest', value: Math.max(0.1, max - smoothVal), fill: '#f1f5f9' }
      ];
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@700;900&display=swap');
        
        .dashboard-container { 
            background: #fdfcfb; 
            min-height: 100vh; 
            padding: 30px; 
            font-family: 'Outfit', sans-serif; 
            color: #0d2c1a; 
        }
        
        .dashboard-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 20px; 
            max-width: 1600px; 
            margin: 0 auto; 
        }
        
        .card { 
            background: #ffffff; 
            border: 1px solid rgba(26, 77, 46, 0.08); 
            border-radius: 20px; 
            padding: 24px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
        }
        .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(26, 77, 46, 0.05); }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-label { font-size: 0.7rem; font-weight: 700; color: #8a9a90; text-transform: uppercase; letter-spacing: 0.1em; }
        .card-value { font-size: 2rem; font-weight: 800; color: #1a4d2e; font-family: 'Playfair Display', serif; }

        .gauge-container { display: flex; justify-content: space-between; gap: 15px; margin-top: 10px; }
        .gauge-item { flex: 1; text-align: center; position: relative; }
        .gauge-label { font-size: 0.55rem; font-weight: 800; color: #8a9a90; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }
        
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-right: 8px; display: inline-block; box-shadow: 0 0 8px #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

        .line-bar-bg { height: 6px; background: #f0f4f2; width: 60%; border-radius: 10px; overflow: hidden; }
        .line-bar-fill { height: 100%; background: linear-gradient(90deg, #1a4d2e, #52b788); border-radius: 10px; transition: width 1.5s ease-in-out; }

        .image-replica-card { border-top: 4px solid #1a4d2e; }

        .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
        .cal-day { font-size: 0.7rem; font-weight: 800; color: #cbd5e1; }
        .cal-date { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; border-radius: 12px; transition: 0.3s; }
        .cal-date.active { background: #1a4d2e; color: #fff; box-shadow: 0 4px 12px rgba(26, 77, 46, 0.3); }

        .spark-container { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8faf9; border-radius: 12px; margin-bottom: 10px; }
      `}</style>

      <div className="dashboard-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a4d2e', fontFamily: 'Playfair Display', margin: 0 }}>TeachFlow Intelligence</h1>
            </div>
            <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '50px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                <span className="status-dot"></span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1a4d2e', letterSpacing: '1px' }}>CORE LIVE: {new Date().toLocaleTimeString()}</span>
            </div>
        </header>

        <div className="dashboard-grid">
            {/* COLUMN 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card image-replica-card">
                    <div className="card-label" style={{ marginBottom: '15px' }}>Performance Stack</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                            <span>TEACHING EFFICIENCY</span>
                            <div className="line-bar-bg"><div className="line-bar-fill" style={{ width: `${60 + Math.sin(liveOffset * 0.1) * 5 + Math.random() * 2}%` }}></div></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                            <span>RESEARCH IMPACT</span>
                            <div className="line-bar-bg"><div className="line-bar-fill" style={{ width: `${40 + Math.cos(liveOffset * 0.1) * 5 + Math.random() * 2}%` }}></div></div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 180 }}>
                        <ResponsiveContainer>
                            <AreaChart data={liveData.slice(-12)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.3}/><stop offset="95%" stopColor="#1a4d2e" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#1a4d2e" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                                <Area type="monotone" dataKey="s" stroke="#52b788" strokeWidth={2} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-label">System Saturation</div>
                    <div className="gauge-container">
                        <div className="gauge-item">
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={gaugeData(moduleCounts.teaching, 20)} innerRadius={36} outerRadius={46} dataKey="value" startAngle={210} endAngle={-30} animationDuration={1000} stroke="none" cornerRadius={10}>
                                        <Cell fill="#1a4d2e" /><Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="card-value" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{moduleCounts.teaching}</div>
                                <div className="gauge-label">COURSES</div>
                            </div>
                        </div>
                        <div className="gauge-item">
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={gaugeData(moduleCounts.research, 20)} innerRadius={36} outerRadius={46} dataKey="value" startAngle={210} endAngle={-30} animationDuration={1000} stroke="none" cornerRadius={10}>
                                        <Cell fill="#52b788" /><Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="card-value" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{moduleCounts.research}</div>
                                <div className="gauge-label">PUBS</div>
                            </div>
                        </div>
                        <div className="gauge-item">
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={gaugeData(total, 50)} innerRadius={36} outerRadius={46} dataKey="value" startAngle={210} endAngle={-30} animationDuration={1000} stroke="none" cornerRadius={10}>
                                        <Cell fill="#0d2c1a" /><Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="card-value" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{total}</div>
                                <div className="gauge-label">TOTAL</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-label">Impact Trend</div>
                    <div style={{ width: '100%', height: 200, marginTop: '10px' }}>
                        <ResponsiveContainer>
                            <LineChart data={liveData.slice(-15)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="value" name="Teaching" stroke="#1a4d2e" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                <Line type="monotone" dataKey="s" name="Research" stroke="#f4a261" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* COLUMN 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card image-replica-card">
                    <div className="card-header"><div className="card-label">Real-time Stream</div><div className="card-value" style={{ fontSize: '1.5rem' }}>{Math.floor(liveData[liveData.length-1].value * 10)}</div></div>
                    <div style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer>
                            <AreaChart data={liveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="stepAfter" dataKey="value" stroke="#1a4d2e" fill="#1a4d2e20" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '40px', marginTop: '15px' }}>
                        {liveData.slice(-25).map((d, i) => <div key={i} style={{ flex: 1, background: '#1a4d2e20', height: `${d.value}%`, borderRadius: '1px' }}></div>)}
                    </div>
                </div>

                <div className="card">
                    <div className="calendar">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="cal-day">{d}</div>)}
                        {Array.from({ length: 31 }, (_, i) => (
                            <div key={i} className={`cal-date ${i+1 === new Date().getDate() ? 'active' : ''}`}>{i + 1}</div>
                        ))}
                    </div>
                </div>

                <div className="card image-replica-card">
                    <div className="card-label">Academic Strengths</div>
                    <div style={{ width: '100%', height: 240, marginTop: '10px' }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Radar name="Current" dataKey="A" stroke="#1a4d2e" fill="#1a4d2e" fillOpacity={0.5} />
                                <Radar name="Goal" dataKey="B" stroke="#52b788" fill="#52b788" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* COLUMN 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card image-replica-card">
                    <div className="card-label">Volume distribution</div>
                    <div style={{ width: '100%', height: 180, marginTop: '10px' }}>
                        <ResponsiveContainer>
                            <BarChart data={liveData.slice(-12)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="value" fill="#1a4d2e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden', height: '240px' }}>
                    <div style={{ padding: '20px 20px 0 20px' }}><span className="card-label">GLOBAL REACH DISTRIBUTION</span></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" dataKey="x" domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#64748b' }} />
                            <YAxis type="number" dataKey="y" domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} label={{ value: 'Latitude', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                            <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return <div style={{ background: '#fff', padding: '5px 10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800 }}>{payload[0].payload.name}: {Math.floor(payload[payload.length-1].value)} units</div>
                                }
                                return null;
                            }} />
                            <Scatter name="Distribution" data={geoData} fill="#1a4d2e" fillOpacity={0.6}>
                                {geoData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#1a4d2e', '#2e6a4f', '#40916c', '#52b788', '#74c69d'][index % 5]} />)}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="spark-container">
                        <div style={{ display: 'flex', alignItems: 'center' }}><span className="status-dot"></span> <span className="card-label">NETWORK {70 + (liveOffset % 5)}%</span></div>
                        <div style={{ width: 40, height: 20 }}><ResponsiveContainer><LineChart data={liveData.slice(-5)}><Line dataKey="value" stroke="#1a4d2e" dot={false} strokeWidth={2}/></LineChart></ResponsiveContainer></div>
                    </div>
                    <div className="spark-container">
                        <div style={{ display: 'flex', alignItems: 'center' }}><span className="status-dot"></span> <span className="card-label">UPTIME 99.98%</span></div>
                        <div style={{ width: 40, height: 20 }}><ResponsiveContainer><LineChart data={liveData.slice(-5)}><Line dataKey="s" stroke="#22c55e" dot={false} strokeWidth={2}/></LineChart></ResponsiveContainer></div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-label">Weekly Activity</div>
                    <div style={{ width: '100%', height: 200, marginTop: '10px' }}>
                        <ResponsiveContainer>
                            <BarChart data={stackedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="teaching" stackId="a" fill="#1a4d2e" name="Teaching" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="research" stackId="a" fill="#52b788" name="Research" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;