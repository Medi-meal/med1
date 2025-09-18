import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '772559724147-utfpmphmr81s84n2eao0fnl7likdp79r.apps.googleusercontent.com';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [agree, setAgree] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('medimeal_user'));
    if (user && user.email) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      setShowTermsError(true);
      return;
    }
    setShowTermsError(false);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, { name, email, password });
      setMsg(res.data.message);
      if (res.data.message && res.data.message.toLowerCase().includes('signup successful')) {
        localStorage.setItem('medimeal_user', JSON.stringify({ name, email }));
        setTimeout(() => navigate('/dashboard'), 300);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div
      className="auth-bg"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Background image with overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          zIndex: 0,
          filter: 'brightness(0.7) blur(1px)',
          transition: 'opacity 1.2s'
        }}
      />
      {/* Animated welcome text */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 600,
          textShadow: '0 2px 12px #0a234299',
          animation: 'fade-in 1.5s'
        }}
      >
        Welcome to Medimeal<br />
        <span style={{ fontSize: '1.1rem', fontWeight: 400 }}>
          Eat healthy, live happy. Your personalized meal journey starts here!
        </span>
      </div>
      {/* Signup card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '7rem' }}>
        <div className="auth-card">
          <div className="auth-title" style={{ color: '#0a2342' }}>Sign Up</div>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="mb-3">
              <label className="auth-label" style={{ color: '#0a2342' }}>Name</label>
              <input
                type="text"
                className="form-control auth-input"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="auth-label" style={{ color: '#0a2342' }}>Email</label>
              <input
                type="email"
                className="form-control auth-input"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="auth-label" style={{ color: '#0a2342' }}>Password</label>
              <input
                type="password"
                className="form-control auth-input"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3" style={{ marginBottom: '1.2rem' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="terms" style={{ color: '#274472', fontSize: '0.97rem' }}>
                I agree to the <a href="/terms.txt" target="_blank" rel="noopener noreferrer" style={{ color: '#a2b9d7', textDecoration: 'underline' }}>Terms and Conditions</a>
              </label>
            </div>
            {showTermsError && (
              <div className="auth-alert" style={{ background: '#e0e7ef', color: '#0a2342' }}>
                You must agree to the Terms and Conditions to sign up.
              </div>
            )}
            <button className="auth-btn" type="submit" style={{ background: 'linear-gradient(90deg, #0a2342 60%, #274472 100%)', color: '#fff' }} disabled={!name || !email || !password}>Sign Up</button>
            {msg && <div className="alert alert-info auth-alert">{msg}</div>}
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '1rem' }}>
            Already have an account?{' '}
            <span
              style={{ color: '#274472', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  fetch(`${import.meta.env.VITE_BACKEND_URL}/api/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: credentialResponse.credential })
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.email) {
                        localStorage.setItem('medimeal_user', JSON.stringify({ name: data.name, email: data.email }));
                        setMsg('Signup successful');
                        setTimeout(() => navigate('/dashboard'), 300);
                      } else {
                        setMsg('Google signup failed.');
                      }
                    });
                }}
                onError={() => {
                  setMsg('Google Signup Failed');
                }}
                size="large"
                text="signup_with"
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
}