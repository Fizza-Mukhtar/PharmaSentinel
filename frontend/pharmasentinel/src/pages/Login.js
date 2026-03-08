import React, { useState, useContext } from 'react';
import { Shield, User, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.detail || err?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && username.trim() && password.trim()) {
      handleSubmit(e);
    }
  };

  const features = [
    { icon: Shield, text: 'Blockchain-secured authentication' },
    { icon: Lock, text: 'End-to-end encrypted data' },
    { icon: CheckCircle, text: '24/7 secure access control' }
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #6c768d 0%, #4b5668 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div className="position-absolute w-100 h-100 top-0 start-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
        animation: 'pulse 8s ease-in-out infinite'
      }} />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center justify-content-center g-5">
          {/* Left Side - Branding Card */}
          <div className="col-lg-5 col-md-6 text-white d-none d-md-block">
            <div className="mb-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-3 p-3" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #3f3c5f 100%)',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}>
                  <Package style={{ width: '48px', height: '48px' }} />
                </div>
                <div>
                  <h1 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>PharmaSentinel</h1>
                  <p className="mb-0 opacity-75">Secure Supply Chain Platform</p>
                </div>
              </div>
              
              <p className="fs-5 opacity-90 mb-4">
                Track, verify, and secure pharmaceutical products across the entire supply chain with blockchain technology.
              </p>

              <div className="d-flex flex-column gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div className="rounded-2 p-2" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                      <feature.icon style={{ width: '24px', height: '24px' }} />
                    </div>
                    <span className="fw-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="col-lg-5 col-md-6">
            <div className="bg-white rounded-4 shadow-lg p-5" style={{
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Mobile Logo */}
              <div className="text-center mb-4 d-md-none">
                <div className="rounded-3 p-3 d-inline-flex mb-3" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #454868 100%)'
                }}>
                  <Package style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <h2 className="fw-bold" style={{ color: '#0f172a' }}>PharmaSentinel</h2>
              </div>

              {/* Title */}
              <div className="mb-4">
                <h3 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Welcome Back</h3>
                <p className="text-muted mb-0">Enter your credentials to access your dashboard</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3" style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca'
                }}>
                  <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} />
                  <span className="small" style={{ color: '#b91c1c' }}>{error}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="mb-4">
                <label className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <User style={{ width: '18px', height: '18px', color: '#64748b' }} />
                  Username
                </label>
                <input
                  type="text"
                  className="w-100 rounded-3"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Enter your username"
                  style={{
                    border: '2px solid #e2e8f0',
                    padding: '0.875rem 1rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1e293b'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <Lock style={{ width: '18px', height: '18px', color: '#1e293b' }} />
                  Password
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-100 rounded-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    placeholder="Enter your password"
                    style={{
                      border: '2px solid #e2e8f0',
                      padding: '0.875rem 3rem 0.875rem 1rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1e293b'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="position-absolute top-50 end-0 translate-middle-y me-3 bg-transparent border-0"
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '20px', height: '20px', color: '#445266' }} />
                    ) : (
                      <Eye style={{ width: '20px', height: '20px', color: '#48586e' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !username.trim() || !password.trim()}
                className="w-100 d-flex align-items-center justify-content-center gap-2 mb-4 border-0"
                style={{
                  background: (loading || !username.trim() || !password.trim()) 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #1e293b 0%, #414a72 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  cursor: (loading || !username.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: (!loading && username.trim() && password.trim()) 
                    ? '0 4px 15px rgba(59, 130, 246, 0.4)' 
                    : 'none',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={e => {
                  if (!loading && username.trim() && password.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  if (!loading && username.trim() && password.trim()) {
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn style={{ width: '20px', height: '20px' }} />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Support Link */}
              <div className="text-center">
                <p className="text-muted small mb-0">
                  Need help? <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Contact Support</a>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center mt-4 small" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Protected by enterprise-grade blockchain security
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Login;