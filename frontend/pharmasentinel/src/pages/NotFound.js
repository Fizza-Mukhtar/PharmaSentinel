import React from 'react';
import { Home, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingTop: '100px',
      paddingBottom: '2rem'
    }}>
      {/* Background Pattern */}
      <div className="position-absolute w-100 h-100 top-0 start-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                         linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Floating Elements */}
      <div className="position-absolute w-100 h-100 top-0 start-0 overflow-hidden" style={{ opacity: 0.05 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="position-absolute border border-white"
            style={{
              width: '100px',
              height: '100px',
              left: `${(i % 3) * 33}%`,
              top: `${Math.floor(i / 3) * 50}%`,
              animation: `float ${6 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="container position-relative text-center text-white">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* 404 Number */}
            <div className="mb-4">
              <div className="display-1 fw-bold mb-3" style={{
                fontSize: 'clamp(6rem, 15vw, 12rem)',
                lineHeight: '1',
                background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.3
              }}>
                404
              </div>
            </div>

            {/* Icon */}
            <div className="mb-4">
              <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{
                width: '120px',
                height: '120px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)'
              }}>
                <AlertTriangle style={{ width: '60px', height: '60px', color: '#ef4444' }} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="display-4 fw-bold mb-4">Page Not Found</h1>
            
            {/* Description */}
            <p className="fs-5 mb-5" style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem' }}>
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
              <a
                href="/"
                className="btn btn-lg d-inline-flex align-items-center gap-2 px-5 py-3 rounded-3 fw-semibold"
                style={{
                  background: 'white',
                  color: '#1e293b',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                <Home style={{ width: '20px', height: '20px' }} />
                Go Home
              </a>
              <a
                href="/contact"
                className="btn btn-lg d-inline-flex align-items-center gap-2 px-5 py-3 rounded-3 fw-semibold"
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Mail style={{ width: '20px', height: '20px' }} />
                Contact Us
              </a>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
              <p className="small mb-3" style={{ color: '#94a3b8' }}>Quick Links</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {[
                  { name: 'About', path: '/about' },
                  { name: 'How It Works', path: '/howitworks' },
                  { name: 'Traceability', path: '/traceability' },
                  { name: 'Anti-Counterfeit', path: '/anticounterfeit' },
                  { name: 'Supply Chain', path: '/supplychain' }
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.path}
                    className="text-decoration-none small"
                    style={{
                      color: '#cbd5e1',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#cbd5e1'}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-5">
              <button
                onClick={() => window.history.back()}
                className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#5a687a'}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Go back to previous page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;