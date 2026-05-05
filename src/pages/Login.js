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

    // clear field error
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
        headers: {
          "Content-Type": "application/json",
        },
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #1a4d2e;
          --primary-light: #2d6a4f;
          --primary-dark: #0d2c1a;
          --bg-light: #fdfcfb;
          --text-dark: #1a4d2e;
          --text-muted: #64748b;
          --card-bg: rgba(255, 255, 255, 0.9);
          --shadow: 0 20px 60px rgba(26, 77, 46, 0.08);
          --error: #ef4444;
          --input-border: rgba(26, 77, 46, 0.15);
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: 
            linear-gradient(rgba(253, 252, 251, 0.75), rgba(253, 252, 251, 0.75)),
            url('/images/login.png');
          background-size: cover;
          background-position: center;
          font-family: 'Outfit', sans-serif;
          color: var(--text-dark);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* Decorative Floating Circles */
        .login-container::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(26, 77, 46, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 25s ease-in-out infinite;
        }

        .login-container::after {
          content: '';
          position: absolute;
          bottom: -5%;
          left: -5%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 18s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, -20px) scale(1.05);
          }
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(30px);
          }
        }

        /* Logo Section */
        .login-header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }

        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow: 0 10px 30px var(--shadow);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 30px var(--shadow);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 40px var(--shadow-hover);
          }
        }

        .app-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .app-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        /* Login Card */
        .login-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 60px var(--shadow);
          border: 1px solid rgba(26, 77, 46, 0.08);
          animation: fadeInUp 0.8s ease-out 0.4s backwards;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 8px;
          text-align: center;
        }

        .login-description {
          text-align: center;
          color: var(--text-muted);
          margin-bottom: 32px;
          font-size: 0.9375rem;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-dark);
          margin-bottom: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--input-border);
          border-radius: 12px;
          font-size: 1rem;
          font-family: 'Work Sans', sans-serif;
          color: var(--text-dark);
          background: var(--card-bg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .form-input:focus {
          border-color: var(--input-focus);
          box-shadow: 0 0 0 4px rgba(26, 77, 46, 0.1);
          transform: translateY(-2px);
        }

        .form-input.error {
          border-color: var(--error);
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-muted);
          font-size: 1.25rem;
          transition: all 0.3s ease;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: var(--primary);
          background: rgba(26, 77, 46, 0.05);
        }

        .error-message {
          color: var(--error);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Submit Button */
        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          font-size: 1.0625rem;
          font-weight: 600;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(26, 77, 46, 0.25);
          position: relative;
          overflow: hidden;
          margin-top: 8px;
          font-family: 'Work Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 56px;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .submit-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(26, 77, 46, 0.35);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-text {
          position: relative;
          z-index: 1;
        }

        /* Loading Spinner */
        .spinner {
          position: relative;
          z-index: 1;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Additional Links */
        .form-footer {
          margin-top: 24px;
          text-align: center;
        }

        .forgot-password {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .forgot-password:hover {
          color: var(--primary-dark);
          transform: translateX(2px);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--input-border);
        }

        .signup-link {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9375rem;
        }

        .signup-link a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .signup-link a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Back to Home Link */
        .back-to-home {
          text-align: center;
          margin-top: 24px;
          animation: fadeInUp 0.8s ease-out 0.6s backwards;
        }

        .back-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9375rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: var(--primary);
          transform: translateX(-4px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-card {
            padding: 40px 32px;
            border-radius: 20px;
          }

          .app-title {
            font-size: 2rem;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .logo {
            width: 56px;
            height: 56px;
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 16px;
          }

          .login-card {
            padding: 32px 24px;
            border-radius: 16px;
          }

          .app-title {
            font-size: 1.75rem;
          }

          .login-title {
            font-size: 1.375rem;
          }

          .logo {
            width: 48px;
            height: 48px;
            font-size: 24px;
            border-radius: 14px;
          }

          .login-header {
            margin-bottom: 32px;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 0.9375rem;
          }

          .submit-button {
            padding: 14px 28px;
            font-size: 1rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>


      <div className="login-container">
        <div className="login-wrapper">

          <div className="login-header">
            <div className="logo-container">
              <div className="logo">📚</div>
            </div>
            <h1 className="app-title">TeachFlow</h1>
            <p className="app-subtitle">Performance Based Appraisal System</p>
          </div>

          <div className="login-card">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-description">
              Sign in to access your PBAS dashboard
            </p>

            {/* ✅ GENERAL ERROR */}
            {generalError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  fontWeight: "500"
                }}
              >
                ❌ {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* EMAIL */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-message">⚠️ {errors.email}</span>}
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">⚠️ {errors.password}</span>
                )}
              </div>

              {/* SUBMIT */}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="form-footer">
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>

            <div className="divider">OR</div>

            <div className="signup-link">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
