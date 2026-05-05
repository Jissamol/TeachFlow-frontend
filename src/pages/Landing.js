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

        
      </div>
    </>
  );
};

export default Landing;
