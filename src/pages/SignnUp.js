import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignnUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department: "",
    phone: "",
    password: "",
    confirm_password: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Commerce",
    "Other"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.department)
      newErrors.department = "Select department";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit number";

    if (!formData.password)
      newErrors.password = "Password required";
    else if (formData.password.length < 8)
      newErrors.password = "Minimum 8 characters";

    if (formData.password !== formData.confirm_password)
      newErrors.confirm_password = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration successful! Please login.");
        navigate("/login");
      } else {
        alert("❌ Registration failed. Please check the form.");
        const formattedErrors = {};
        for (const key in data) {
          formattedErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
        setErrors(formattedErrors);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .signup-page-container {
          min-height: 100vh;
          background: #f4f7f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          padding: 40px 20px;
        }

        .signup-card-wrapper {
          display: flex;
          background: #ffffff;
          width: 100%;
          max-width: 1000px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(26, 77, 46, 0.08);
        }

        /* Left side - Branding Panel */
        .signup-left-panel {
          flex: 1.1;
          background-image: url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
          background-size: cover;
          background-position: center;
        }

        .left-content {
          position: relative;
          z-index: 2;
        }

        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .brand-subtitle {
          font-size: 1.1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 300;
        }

        .features-list {
          margin-top: 40px;
          list-style: none;
        }

        .features-list li {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .features-list li svg {
          color: #4ade80;
        }

        /* Right side - Form Panel */
        .signup-right-panel {
          flex: 1.2;
          padding: 50px 60px;
          background: #ffffff;
        }

        .signup-header {
          margin-bottom: 30px;
        }

        .signup-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #1a4d2e;
          margin-bottom: 8px;
        }

        .signup-header p {
          color: #64748b;
          font-size: 0.95rem;
        }

        .signup-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1a4d2e;
        }

        .signup-input, .signup-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.3s;
        }

        .signup-input:focus, .signup-select:focus {
          border-color: #1a4d2e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(26, 77, 46, 0.1);
          outline: none;
        }

        .signup-input.error, .signup-select.error {
          border-color: #ef4444;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .general-error {
          grid-column: span 2;
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
        }

        .submit-btn {
          grid-column: span 2;
          background: #1a4d2e;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }

        .submit-btn:hover {
          background: #123620;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(26, 77, 46, 0.15);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-prompt {
          grid-column: span 2;
          text-align: center;
          margin-top: 20px;
          font-size: 0.95rem;
          color: #64748b;
        }

        .login-prompt a {
          color: #1a4d2e;
          font-weight: 600;
          text-decoration: none;
          transition: 0.2s;
        }

        .login-prompt a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .signup-card-wrapper {
            flex-direction: column;
          }
          .signup-left-panel {
            padding: 40px 30px;
          }
          .signup-right-panel {
            padding: 40px 30px;
          }
        }

        @media (max-width: 600px) {
          .signup-form {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .general-error, .submit-btn, .login-prompt {
            grid-column: span 1;
          }
          .signup-page-container {
            padding: 20px 15px;
          }
          .signup-right-panel {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="signup-page-container">
        <div className="signup-card-wrapper">
          
          {/* Left Branding Panel */}
          <div className="signup-left-panel">
           
          </div>

          {/* Right Form Panel */}
          <div className="signup-right-panel">
            <div className="signup-header">
              <h2>Faculty Registration</h2>
              <p>Create your account to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {errors.non_field_errors && (
                <div className="general-error">
                  {errors.non_field_errors}
                </div>
              )}

              <div className="input-group full-width">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`signup-input ${errors.full_name ? "error" : ""}`}
                />
                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Institutional Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@institution.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={`signup-input ${errors.email ? "error" : ""}`}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`signup-input ${errors.phone ? "error" : ""}`}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="input-group full-width">
                <label className="input-label">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`signup-select ${errors.department ? "error" : ""}`}
                >
                  <option value="">Select your department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`signup-input ${errors.password ? "error" : ""}`}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`signup-input ${errors.confirm_password ? "error" : ""}`}
                />
                {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="login-prompt">
                Already have an account? <Link to="/login">Sign In</Link>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default SignnUp;
