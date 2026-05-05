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
        }
    } catch (err) {
        console.error("Failed to fetch profile", err);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileMsg({ type: "", text: "" });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg({ type: "", text: "" });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
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

  return (
    <>
      <style>{`
        .profile-container {
          padding: 40px 24px;
          max-width: 1000px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease;
        }
        
        .profile-header {
          margin-bottom: 32px;
        }

        .profile-title {
          font-family: 'Crimson Pro', serif;
          font-size: 2rem;
          color: #1a4d2e; /* --primary */
          font-weight: 700;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .profile-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }

        .card-title {
          font-family: 'Crimson Pro', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
          margin-bottom: 24px;
          font-weight: 600;
          border-bottom: 2px solid #f0f2f1;
          padding-bottom: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'Work Sans', sans-serif;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: #1a4d2e;
          outline: none;
          box-shadow: 0 0 0 3px rgba(26, 77, 46, 0.1);
        }

        .form-input:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .btn-submit {
          background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 10px;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Work Sans', sans-serif;
          font-size: 1rem;
          margin-top: 8px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(26, 77, 46, 0.2);
        }

        .msg-alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .msg-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .msg-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Profile Settings</h1>
        </div>

        <div className="profile-grid">
          {/* Edit Profile Form */}
          <div className="profile-card">
            <h2 className="card-title">Personal Information</h2>
            
            {profileMsg.text && (
                <div className={`msg-alert msg-${profileMsg.type}`}>
                    {profileMsg.text}
                </div>
            )}

            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label className="form-label">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  name="email"
                  value={profileData.email} 
                  disabled 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={profileData.full_name} 
                  onChange={handleProfileChange}
                  required
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                    name="department" 
                    value={profileData.department} 
                    onChange={handleProfileChange}
                    required
                    className="form-input"
                >
                    <option value="">Select Department</option>
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

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  value={profileData.phone} 
                  onChange={handleProfileChange}
                  required
                  className="form-input" 
                />
              </div>

              <button type="submit" className="btn-submit">Save Changes</button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="profile-card">
            <h2 className="card-title">Change Password</h2>

            {passwordMsg.text && (
                <div className={`msg-alert msg-${passwordMsg.type}`}>
                    {passwordMsg.text}
                </div>
            )}

            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  name="old_password"
                  value={passwordData.old_password} 
                  onChange={handlePasswordChange}
                  required
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  name="new_password"
                  value={passwordData.new_password} 
                  onChange={handlePasswordChange}
                  required
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirm_new_password"
                  value={passwordData.confirm_new_password} 
                  onChange={handlePasswordChange}
                  required
                  className="form-input" 
                />
              </div>

              <button type="submit" className="btn-submit">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
