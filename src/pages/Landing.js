import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: #fdfcfb;
          color: #1a4d2e;
          overflow-x: hidden;
        }

        .landing-container {
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
        }

        /* Public Navbar */
        .public-navbar {
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 60px;
          background: transparent;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #1a4d2e;
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav-link-login {
          color: rgba(26, 77, 46, 0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        .nav-link-login:hover { color: #1a4d2e; }

        .btn-signup {
          background: #1a4d2e;
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: 0.3s ease;
          box-shadow: 0 5px 15px rgba(26, 77, 46, 0.2);
        }

        .btn-signup:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 77, 46, 0.3);
        }

        /* Hero Section */
        .hero {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 60px;
          overflow: hidden;
        }

        .bg-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          filter: brightness(1.1) contrast(1.1);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          background: linear-gradient(
            to right,
            rgba(253, 252, 251, 0.95) 0%,
            rgba(253, 252, 251, 0.7) 50%,
            rgba(253, 252, 251, 0.1) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 700px;
          animation: fadeIn 1.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          color: #1a4d2e;
          text-shadow: 0 5px 15px rgba(26, 77, 46, 0.05);
        }

        .highlight {
          color: #4ade80; /* Vibrant lighter green for emphasis on light theme */
          position: relative;
          display: inline-block;
        }

        .hero-desc {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 40px;
          max-width: 500px;
          line-height: 1.6;
        }

        .buttons {
          display: flex;
          gap: 20px;
        }

        .primary {
          background: #1a4d2e;
          color: #ffffff;
          border: none;
          padding: 18px 40px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 10px 20px rgba(26, 77, 46, 0.15);
        }

        .secondary {
          background: #ffffff;
          color: #1a4d2e;
          border: 1px solid rgba(26, 77, 46, 0.2);
          padding: 16px 38px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.3s;
        }

        .primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(26, 77, 46, 0.25); }
        .secondary:hover { background: #f8faf9; border-color: #1a4d2e; }

        /* Extra Sections */
        .section {
          min-height: 100vh;
          background: #ffffff;
          color: #1a4d2e;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 60px;
          position: relative;
          z-index: 5;
          text-align: center;
          border-top: 1px solid #f1f5f9;
        }

        .section h2 {
          font-family: 'Playfair Display', serif;
          font-size: 3.2rem;
          margin-bottom: 30px;
          color: #1a4d2e;
        }

        .section-desc {
          color: #64748b;
          max-width: 650px;
          font-size: 1.1rem;
          line-height: 1.7;
        }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .hero-title { font-size: 3.5rem; }
          .public-navbar { padding: 0 40px; }
        }

        @media (max-width: 768px) {
          .hero { padding: 0 30px; justify-content: center; text-align: center; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .hero-title { font-size: 2.8rem; }
          .hero-desc { margin-left: auto; margin-right: auto; }
          .overlay { background: rgba(253, 252, 251, 0.7); }
          .public-navbar { padding: 0 30px; }
          .nav-links { display: none; }
        }

        /* Badge */
        .badge {
          background: #e8f5e9;
          color: #1a4d2e;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          display: inline-block;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          width: 100%;
          max-width: 1200px;
          margin-top: 60px;
        }

        .feature-card {
          background: #ffffff;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(26, 77, 46, 0.05);
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid #f1f5f9;
          border-top: 4px solid #1a4d2e;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(180deg, rgba(74, 222, 128, 0.05) 0%, rgba(255,255,255,0) 100%);
          z-index: 0;
          opacity: 0;
          transition: 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(26, 77, 46, 0.12);
        }
        
        .feature-icon, .feature-title, .feature-text {
          position: relative;
          z-index: 1;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: #e8f5e9;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          color: #1a4d2e;
        }

        .feature-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #1a4d2e;
        }

        .feature-text {
          color: #64748b;
          line-height: 1.6;
          font-size: 1rem;
        }

        /* Image Section */
        .image-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          width: 100%;
          gap: 60px;
          margin-top: 40px;
          text-align: left;
        }

        .image-content {
          flex: 1;
        }
        
        .image-content h2 {
          text-align: left;
          font-size: 2.8rem;
        }

        .image-content .section-desc {
          text-align: left;
          margin-bottom: 30px;
        }

        .image-wrapper {
          flex: 1;
          position: relative;
        }

        .image-wrapper::before {
          content: "";
          position: absolute;
          top: -20px;
          bottom: -20px;
          left: -20px;
          right: 20px;
          background: #e8f5e9;
          border-radius: 20px;
          z-index: 0;
        }

        .image-wrapper img {
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(26, 77, 46, 0.15);
          position: relative;
          z-index: 1;
        }

        @media (max-width: 992px) {
          .image-section {
            flex-direction: column;
            text-align: center;
          }
          .image-content h2, .image-content .section-desc {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* CTA Banner */
        .cta-container {
          padding: 100px 60px;
          background: #ffffff;
          display: flex;
          justify-content: center;
        }

        .cta-banner {
          background: linear-gradient(135deg, #1a4d2e 0%, #0d2717 100%);
          width: 100%;
          max-width: 1200px;
          border-radius: 30px;
          padding: 80px 40px;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 25px 50px rgba(26, 77, 46, 0.25);
          position: relative;
          overflow: hidden;
        }

        .cta-banner::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, rgba(255,255,255,0) 60%);
          z-index: 0;
        }

        .cta-banner-content {
          position: relative;
          z-index: 1;
        }

        .cta-banner h2 {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          margin-bottom: 20px;
          color: #ffffff;
        }

        .cta-banner p {
          color: #a7f3d0;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .cta-container { padding: 60px 30px; }
          .cta-banner { padding: 60px 30px; }
          .cta-banner h2 { font-size: 2.2rem; }
        }
      `}</style>
      
      <div className="landing-container">
        
        <nav className="public-navbar">
          <Link to="/" className="brand">
            <span className="brand-text">TeachFlow</span>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link-login">Login</Link>
            <Link to="/login" className="btn-signup">Get Started</Link>
          </div>
        </nav>

        <section className="hero">
          <video className="bg-video" autoPlay loop muted playsInline poster="https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=2000">
            <source src="/video/video.mp4" type="video/mp4" />
          </video>

          <div className="overlay" />

          <div className="hero-content">
            <h1 className="hero-title">
              Elevate Your Academic <span className="highlight">Career Excellence</span>
            </h1>
            <p className="hero-desc">
              Precision performance tracking and automated PBAS reporting designed for modern educational institutions and faculty development.
            </p>
            <div className="buttons">
              <button className="primary" onClick={() => navigate('/login')}>Get Started</button>
              <button className="secondary" onClick={() => navigate('/login')}>Explore Features</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f4f9f5 100%)' }}>
          <span className="badge">Platform Features</span>
          <h2>Why Choose TeachFlow?</h2>
          <p className="section-desc">
            Discover a comprehensive suite of tools designed to streamline academic evaluations and boost institutional efficiency.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 className="feature-title">Automated PBAS</h3>
              <p className="feature-text">
                Generate Performance Based Appraisal System reports effortlessly. Reduce paperwork and focus more on qualitative teaching and research.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h3 className="feature-title">Performance Analytics</h3>
              <p className="feature-text">
                Track your academic progress with intuitive dashboards. Visualize your contributions and identify areas for professional growth.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="feature-title">Faculty Collaboration</h3>
              <p className="feature-text">
                Connect with peers, share research insights, and foster a collaborative environment within your educational institution.
              </p>
            </div>
          </div>
        </section>

        {/* Info Section with Image */}
        <section className="section" style={{ background: '#fdfcfb' }}>
          <div className="image-section">
            <div className="image-content">
              <h2>Empowering Educational Institutions</h2>
              <p className="section-desc">
                TeachFlow modernizes how academic accomplishments are recorded, evaluated, and celebrated. By digitizing the faculty development process, institutions can ensure transparent and objective performance metrics.
              </p>
              <button className="primary" onClick={() => navigate('/login')}>Join the Platform</button>
            </div>
            <div className="image-wrapper">
              <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000" alt="Faculty collaboration" />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <div className="cta-container">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <h2>Ready to Transform Your Academic Journey?</h2>
              <p>
                Join thousands of educators who are already using TeachFlow to advance their careers and contribute effectively to their institutions.
              </p>
              <button className="primary" style={{ background: '#ffffff', color: '#1a4d2e' }} onClick={() => navigate('/login')}>
                Create Free Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Landing;
