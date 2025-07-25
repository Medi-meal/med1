import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../components/NotificationProvider'; // Corrected import path
import './Landing.css';
import medimealLogo from '../assets/medimeal-logo.jpg';

const Landing = ({ showAbout, setShowAbout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('medimeal_user')));

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('medimeal_user')));
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000); // Check every second for changes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Enhanced Get Started button functionality
  const handleGetStarted = () => {
    if (user && user.email) {
      // User is signed in, navigate to recommendations
      navigate('/recommend#recommendations');
    } else {
      // User is not signed in, navigate to signup
      navigate('/signup');
    }
  };

  const { showSuccess, showError } = useNotifications();

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      text: "Medimeal has revolutionized how I recommend dietary plans to my patients. The AI-powered suggestions are incredibly accurate.",
      avatar: "👩‍⚕️"
    },
    {
      name: "Michael Chen",
      role: "Diabetes Patient",
      text: "Since using Medimeal, my blood sugar levels have stabilized significantly. The meal recommendations are both delicious and healthy.",
      avatar: "👨"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Nutritionist",
      text: "The integration of medication interactions with dietary recommendations is groundbreaking. My patients love it!",
      avatar: "👩‍🔬"
    }
  ];

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Recommendations",
      description: "Our advanced AI analyzes your health profile and medications to suggest personalized meal plans."
    },
    {
      icon: "💊",
      title: "Medication-Food Interaction Checker",
      description: "Avoid dangerous food-drug interactions with our comprehensive database of medication warnings."
    },
    {
      icon: "📊",
      title: "Health Progress Tracking",
      description: "Monitor your health improvements with detailed analytics and progress reports."
    },
    {
      icon: "👨‍⚕️",
      title: "Doctor Approved",
      description: "All recommendations are reviewed by licensed healthcare professionals for safety and efficacy."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Users" },
    { number: "1,200+", label: "Healthcare Providers" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  useEffect(() => {
    if (location.hash === '#features') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.hash === '#testimonials') {
      document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.hash === '#about') {
      setShowAbout(true);
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location, setShowAbout]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* HERO SECTION */}
      <header className="landing-header">
        <div className="header-left">
          <div className="logo-container">
            <img src={medimealLogo} alt="Medimeal Logo" className="logo-image" />
            <span className="logo-text">Medimeal</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); setShowAbout(true); scrollToSection('about'); }}>About</a>
        </nav>
        <div className="header-right">
          <button 
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="signup-btn"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <section className="landing-hero slide-up" style={{ background: 'linear-gradient(90deg, #fff 60%, #e0e7ef 100%)' }}>
        <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="hero-text">
            <h2 style={{ fontSize: '2.3rem', color: '#0a2342', fontWeight: 600, marginBottom: '1.2rem' }}>Personalized Food Recommendations for Your Health</h2>
            <p style={{ fontSize: '1.15rem', color: '#334155', marginBottom: '2.2rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>Medimeal uses advanced AI to recommend meal plans tailored to your medication, age, and health conditions. Eat smarter, feel better, and take control of your wellness journey.</p>
            <button 
              className="start-button"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section slide-up">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Medimeal?</h2>
            <p>Experience the future of personalized nutrition with our cutting-edge features</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section fade-in">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works-section slide-up">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get personalized meal recommendations in just 3 simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step-item bounce-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Tell us about your health conditions, medications, and dietary preferences</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item bounce-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Get AI Analysis</h3>
                <p>Our AI analyzes your profile and generates personalized meal recommendations</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item bounce-in" style={{ animationDelay: '0.3s' }}>
              <div className="step-content">
                <h3>Enjoy Healthy Meals</h3>
                <p>Follow your customized meal plan and track your health progress</p>
              </div>
              <div className="step-number">3</div>
            </div>
          </div>
          <div className="cta-container">
            <button 
              className="cta-button"
              onClick={handleGetStarted}
            >
              Start Your Health Journey
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="testimonials-section fade-in">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Hear from healthcare professionals and patients who trust Medimeal</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="final-cta-section slide-up">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Health?</h2>
            <p>Join thousands of users who have improved their health with Medimeal's personalized nutrition recommendations.</p>
            <div className="cta-buttons">
              <button 
                className="primary-cta-button"
                onClick={handleGetStarted}
              >
                Get Started Now
              </button>
              <button 
                className="secondary-cta-button"
                onClick={() => navigate('/login')}
              >
                Already have an account?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (conditionally rendered) */}
      {showAbout && (
        <section id="about" className="about-section fade-in">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>About Medimeal</h2>
                <p>Medimeal is a revolutionary healthcare technology platform that combines artificial intelligence with nutritional science to provide personalized meal recommendations for individuals taking medications.</p>
                <p>Our mission is to help people maintain optimal health by ensuring their diet works harmoniously with their medication regimen, preventing dangerous interactions while promoting healing and wellness.</p>
                <div className="about-features">
                  <div className="about-feature">
                    <span className="feature-icon">🔬</span>
                    <span>Scientifically Backed</span>
                  </div>
                  <div className="about-feature">
                    <span className="feature-icon">👨‍⚕️</span>
                    <span>Doctor Approved</span>
                  </div>
                  <div className="about-feature">
                    <span className="feature-icon">🛡️</span>
                    <span>Privacy Protected</span>
                  </div>
                </div>
                <button 
                  className="about-cta-button"
                  onClick={handleGetStarted}
                >
                  Start Your Journey
                </button>
              </div>
              <div className="about-image">
                <img src={medimealLogo} alt="Medimeal Team" className="about-img" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-logo">
                <img src={medimealLogo} alt="Medimeal Logo" className="footer-logo-image" />
                <span className="footer-logo-text">Medimeal</span>
              </div>
              <p>Personalized nutrition for better health outcomes.</p>
            </div>
            <div className="footer-center">
              <div className="footer-links">
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
                <a href="#about" onClick={(e) => { e.preventDefault(); setShowAbout(true); scrollToSection('about'); }}>About</a>
                <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms</a>
              </div>
            </div>
            <div className="footer-right">
              <button 
                className="footer-cta-button"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Medimeal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
