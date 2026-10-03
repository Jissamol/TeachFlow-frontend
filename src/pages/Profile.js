import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    full_name: "",
    department: "",
    phone: "",
    email: ""
  });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [profilePicBase64, setProfilePicBase64] = useState(localStorage.getItem("profile_picture") || null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: ""
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load existing user data from local storage to fill initial form
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser || !storedUser.email) {
        navigate("/"); // Redirect to login if no active user
        return;
    }
    setUser(storedUser);
    
    // Fetch latest from API to ensure it's up to date
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            setProfileData({
                full_name: data.full_name || "",
                department: data.department || "",
                phone: data.phone || "",
                email: data.email || ""
            });
            if (data.profile_picture) {
                const picUrl = data.profile_picture.startsWith('http') ? data.profile_picture : `http://127.0.0.1:8000${data.profile_picture}`;
                setProfilePicBase64(picUrl);
                localStorage.setItem("profile_picture", picUrl);
            }
        }
    } catch (err) {
        console.error("Failed to fetch profile", err);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileMsg({ type: "", text: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicBase64(reader.result);
        localStorage.setItem("profile_picture", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg({ type: "", text: "" });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    const formData = new FormData();
    formData.append("full_name", profileData.full_name);
    formData.append("department", profileData.department);
    formData.append("phone", profileData.phone);
    if (profilePicFile) {
        formData.append("profile_picture", profilePicFile);
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setProfileMsg({ type: "success", text: "Profile updated successfully!" });
            // Update local storage
            const updatedUser = { ...user, full_name: data.full_name, department: data.department };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else {
            setProfileMsg({ type: "error", text: data.detail || "Failed to update profile." });
        }
    } catch (err) {
        setProfileMsg({ type: "error", text: "Network error occurred." });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_new_password) {
        setPasswordMsg({ type: "error", text: "New passwords do not match." });
        return;
    }

    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/change-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                confirm_new_password: passwordData.confirm_new_password
            })
        });
        const data = await res.json();
        if (res.ok) {
            setPasswordMsg({ type: "success", text: "Password changed successfully!" });
            setPasswordData({ old_password: "", new_password: "", confirm_new_password: "" });
        } else {
            const errorText = data.old_password ? data.old_password[0] : (data.non_field_errors ? data.non_field_errors[0] : "Failed to change password.");
            setPasswordMsg({ type: "error", text: errorText });
        }
    } catch (err) {
        setPasswordMsg({ type: "error", text: "Network error occurred." });
    }
  };

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <>
      <style>{`
        .desk-wrapper { 
            min-height: 100vh; 
            background: #e2e8f0; 
            background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
            background-size: 20px 20px;
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            padding: 40px 20px; 
            font-family: 'Work Sans', sans-serif; 
        }

        .id-card-scene { 
            width: 100%; 
            max-width: 850px; 
            height: 520px; 
            perspective: 1500px; 
            position: relative; 
            margin-bottom: 40px; 
        }

        .id-card-inner { 
            width: 100%; 
            height: 100%; 
            position: relative; 
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
            transform-style: preserve-3d; 
        }
        .id-card-inner.is-flipped { 
            transform: rotateY(180deg); 
        }

        .id-card-face { 
            position: absolute; 
            width: 100%; 
            height: 100%; 
            backface-visibility: hidden; 
            -webkit-backface-visibility: hidden;
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 30px 60px rgba(0,0,0,0.15), inset 0 0 0 10px white, inset 0 0 0 12px #e2e8f0; 
            overflow: hidden; 
            display: flex; 
            flex-direction: column; 
        }
        .id-card-back { 
            transform: rotateY(180deg); 
            background: #f8fafc; 
        }

        /* Lanyard Cutout */
        .lanyard-cutout { 
            position: absolute; 
            top: 15px; 
            left: 50%; 
            transform: translateX(-50%); 
            width: 80px; 
            height: 16px; 
            background: #e2e8f0; 
            border-radius: 10px; 
            box-shadow: inset 0 3px 6px rgba(0,0,0,0.2); 
            z-index: 10; 
            border: 2px solid white; 
        }

        /* Front Header */
        .card-header { 
            height: 100px; 
            background: #1a4d2e; 
            display: flex; 
            justify-content: center; 
            align-items: flex-end; 
            padding-bottom: 20px; 
            color: white; 
            letter-spacing: 5px; 
            font-weight: 800; 
            font-size: 1.4rem; 
            text-transform: uppercase; 
            font-family: 'Playfair Display', serif; 
        }

        .card-body { 
            display: flex; 
            flex: 1; 
            padding: 40px; 
            gap: 50px; 
            position: relative; 
        }

        /* Watermark */
        .card-body::before { 
            content: 'TEACHFLOW'; 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(-30deg); 
            font-size: 7rem; 
            font-weight: 900; 
            color: rgba(26,77,46,0.03); 
            z-index: 0; 
            pointer-events: none; 
            font-family: 'Playfair Display', serif; 
        }

        /* Left Avatar */
        .avatar-col { 
            width: 220px; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            z-index: 1; 
        }
        .photo-container {
            position: relative; 
            padding: 8px; 
            border: 1px dashed rgba(26,77,46,0.4); 
            border-radius: 50%; 
            margin-bottom: 25px;
        }
        .photo-box { 
            width: 170px; 
            height: 170px; 
            border: 4px solid #1a4d2e; 
            border-radius: 50%;
            background: #f1f5f9; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-size: 5rem; 
            font-family: 'Playfair Display', serif; 
            font-weight: 700; 
            color: #1a4d2e; 
            position: relative; 
            cursor: pointer;
            overflow: hidden;
        }
        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-upload-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(26,77,46,0.85);
            color: white;
            font-size: 0.75rem;
            text-align: center;
            padding: 10px 0 15px 0;
            font-family: 'Work Sans', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0;
            transition: 0.3s;
        }
        .photo-box:hover .photo-upload-overlay {
            opacity: 1;
        }

        .seal-btn { 
            width: 100%; 
            background: #1a4d2e; 
            color: white; 
            padding: 8px 24px; 
            text-align: center; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            border: none; 
            cursor: pointer; 
            border-radius: 10px; 
            transition: all 0.2s ease; 
            font-family: 'Work Sans', sans-serif;
            font-size: 0.9rem;
        }
        .seal-btn:hover { background: #123620; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26, 77, 46, 0.2); }

        /* Right Form */
        .info-col { 
            flex: 1; 
            z-index: 1; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            gap: 25px; 
        }

        .id-field { display: flex; flex-direction: column; }
        .id-label { 
            font-size: 0.75rem; 
            font-weight: 800; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            margin-bottom: 4px; 
            font-family: 'Work Sans', sans-serif;
        }
        .id-input { 
            border: none; 
            border-bottom: 2px dashed #cbd5e1; 
            background: transparent; 
            font-family: 'Work Sans', sans-serif; 
            font-size: 1.3rem; 
            color: #1a4d2e; 
            font-weight: 600; 
            padding: 6px 0; 
            outline: none; 
            transition: 0.3s; 
            border-radius: 0;
            letter-spacing: 0.5px;
        }
        .id-input:focus { border-bottom: 2px solid #1a4d2e; }
        .id-input:disabled { color: #64748b; border-bottom-color: #e2e8f0; }

        select.id-input { appearance: none; cursor: pointer; }

        /* Back Security */
        .back-header { 
            height: 90px; 
            background: #64748b; 
            display: flex; 
            justify-content: center; 
            align-items: flex-end; 
            padding-bottom: 15px; 
            color: white; 
            letter-spacing: 4px; 
            font-weight: 800; 
            font-size: 1.2rem; 
            text-transform: uppercase; 
            font-family: 'Playfair Display', serif; 
        }
        .mag-stripe { height: 60px; background: #0f172a; width: 100%; margin-top: 25px; }

        .back-body { padding: 40px 80px; display: flex; flex-direction: column; gap: 30px; flex: 1; z-index: 1; justify-content: center; }
        .back-body .id-input { font-size: 1.2rem; }

        .controls { display: flex; gap: 20px; }
        .flip-btn { 
            background: white; 
            color: #1a4d2e; 
            border: 2px solid #1a4d2e; 
            padding: 14px 40px; 
            font-weight: 800; 
            border-radius: 30px; 
            cursor: pointer; 
            font-size: 1rem; 
            transition: 0.3s; 
            font-family: 'Work Sans', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .flip-btn:hover { background: #1a4d2e; color: white; }

        .msg-alert { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 10px 25px; border-radius: 30px; font-size: 0.85rem; font-weight: 700; z-index: 100; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .msg-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .msg-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        @media (max-width: 900px) {
            .id-card-scene { height: auto; perspective: none; }
            .id-card-inner { transform: none !important; transition: none; display: flex; flex-direction: column; gap: 20px; }
            .id-card-face { position: relative; height: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .id-card-back { transform: none; }
            .card-body { flex-direction: column; padding: 30px 20px; align-items: center; gap: 30px; }
            .avatar-col { width: 100%; }
            .info-col { width: 100%; }
            .flip-btn { display: none; }
        }
      `}</style>
      
      <div className="desk-wrapper">
        
        <div className="id-card-scene">
            <div className={`id-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                
                {/* FRONT: Personal Info */}
                <div className="id-card-face id-card-front">
                    <div className="lanyard-cutout"></div>
                    <div className="card-header">
                        Faculty Identification
                    </div>
                    
                    {profileMsg.text && (
                        <div className={`msg-alert msg-${profileMsg.type}`}>
                            {profileMsg.text}
                        </div>
                    )}
                    
                    <form className="card-body" onSubmit={updateProfile}>
                        <div className="avatar-col">
                            <div className="photo-container">
                                <div className="photo-box" onClick={() => document.getElementById('profilePicInput').click()} title="Click to upload picture">
                                    {profilePicBase64 ? (
                                        <img src={profilePicBase64} alt="Profile" />
                                    ) : (
                                        <>{profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : (user && user.username ? user.username.charAt(0).toUpperCase() : 'F')}</>
                                    )}
                                    <div className="photo-upload-overlay">Update</div>
                                </div>
                                <input type="file" id="profilePicInput" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                            </div>
                            <button type="submit" className="seal-btn">Approve Identity</button>
                        </div>
                        
                        <div className="info-col">
                            <div className="id-field">
                                <label className="id-label">Official Registry ID (Email)</label>
                                <input type="email" name="email" value={profileData.email} disabled className="id-input" />
                            </div>
                            
                            <div className="id-field">
                                <label className="id-label">Legal Name</label>
                                <input type="text" name="full_name" value={profileData.full_name} onChange={handleProfileChange} required className="id-input" />
                            </div>
                            
                            <div className="id-field">
                                <label className="id-label">Assigned Department</label>
                                <select name="department" value={profileData.department} onChange={handleProfileChange} required className="id-input">
                                    <option value="">-- Select --</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="English">English</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="id-field">
                                <label className="id-label">Contact Number</label>
                                <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} required className="id-input" />
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* BACK: Security */}
                <div className="id-card-face id-card-back">
                    <div className="lanyard-cutout"></div>
                    <div className="back-header">
                        Security Clearance
                    </div>
                    <div className="mag-stripe"></div>
                    
                    {passwordMsg.text && (
                        <div className={`msg-alert msg-${passwordMsg.type}`}>
                            {passwordMsg.text}
                        </div>
                    )}
                    
                    <form className="back-body" onSubmit={changePassword}>
                        <div className="id-field">
                            <label className="id-label">Current Passkey</label>
                            <input type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required className="id-input" />
                        </div>
                        
                        <div className="id-field">
                            <label className="id-label">New Passkey</label>
                            <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required className="id-input" />
                        </div>
                        
                        <div className="id-field">
                            <label className="id-label">Confirm New Passkey</label>
                            <input type="password" name="confirm_new_password" value={passwordData.confirm_new_password} onChange={handlePasswordChange} required className="id-input" />
                        </div>
                        
                        <button type="submit" className="seal-btn" style={{marginTop: '10px'}}>Update Clearance</button>
                    </form>
                </div>
                
            </div>
        </div>

        <div className="controls">
            <button className="flip-btn" onClick={() => setIsFlipped(!isFlipped)}>
                {isFlipped ? "⟲ FLIP TO FRONT (IDENTITY)" : "⟳ FLIP TO BACK (SECURITY)"}
            </button>
        </div>
        
      </div>
    </>
  );
};

export default Profile;
