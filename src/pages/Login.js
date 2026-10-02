import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setGeneralError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setGeneralError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&family=Playfair+Display:wght@600;700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #1a4d2e;
          --primary-hover: #123620;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --error: #ef4444;
        }

        .login-page-wrapper {
          min-height: 100vh;
          /* Beautiful split gradient overlay on top of the NEW image */
          background-image: 
            linear-gradient(to right, rgba(26, 77, 46, 0.8) 0%, rgba(26, 77, 46, 0.2) 100%),
            url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          position: relative;
          padding: 20px;
        }

        .back-button {
          position: absolute;
          top: 40px;
          left: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .back-button:hover {
          transform: translateX(-5px);
          background: rgba(255, 255, 255, 0.25);
        }

        /* Glassmorphism Card */
        .login-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          width: 100%;
          max-width: 460px;
          border-radius: 24px;
          padding: 50px 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(90deg, #1a4d2e, #4ade80);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-description {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        /* Floating Label Inputs */
        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 22px 16px 10px 16px;
          border: 2px solid rgba(26, 77, 46, 0.1);
          border-radius: 12px;
          font-size: 1.05rem;
          font-family: 'Outfit', sans-serif;
          color: var(--text-dark);
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.7);
        }

        .form-input:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(26, 77, 46, 0.08);
          outline: none;
        }

        .form-input.error {
          border-color: var(--error);
        }

        .floating-label {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-input:focus ~ .floating-label,
        .form-input:not(:placeholder-shown) ~ .floating-label {
          top: 14px;
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 600;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 1.2rem;
          transition: 0.3s;
        }

        .password-toggle:hover {
          color: var(--primary);
        }

        .error-message {
          color: var(--error);
          font-size: 0.85rem;
          margin-top: 6px;
          margin-left: 4px;
        }

        .submit-button {
          background: linear-gradient(135deg, var(--primary) 0%, #2d6a4f 100%);
          color: #ffffff;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 10px 20px rgba(26, 77, 46, 0.2);
        }

        .submit-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 25px rgba(26, 77, 46, 0.3);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 30px 0;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(26, 77, 46, 0.15);
        }

        .links-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .links-container a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }

        .links-container a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .back-button {
            top: 20px;
            left: 20px;
            padding: 8px 16px;
          }
          .login-card {
            padding: 40px 24px;
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="login-page-wrapper">
        <Link to="/" className="back-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Home
        </Link>

        <div className="login-card">
          <div className="brand-header">
            <h2 className="login-title">TeachFlow</h2>
            <p className="login-description">
              Sign in to your PBAS dashboard
            </p>
          </div>

          {generalError && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "14px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.95rem", fontWeight: "600" }}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder=" "
              />
              <label className="floating-label">Email Address</label>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder=" "
              />
              <label className="floating-label">Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading && <div className="spinner"></div>}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="divider">OR</div>

          <div className="links-container">
            <div>
              <a href="#">Forgot your password?</a>
            </div>
            <div>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
