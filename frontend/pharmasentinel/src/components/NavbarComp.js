import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, User, LogOut, Bell } from 'lucide-react';

const NavbarComp = ({ user = null, logout = () => {} }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/howitworks' },
    { name: 'Traceability', path: '/traceability' },
    { name: 'Anti-Counterfeit', path: '/anticounterfeit' },
    { name: 'Supply Chain', path: '/supplychain' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <style>{`
        .navbar-minimal {
          transition: all 0.3s ease;
        }
        .nav-link-minimal {
          position: relative;
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        .nav-link-minimal:hover {
          color: #0f172a;
        }
        .nav-link-minimal::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #475569 0%, #64748b 100%);
          transition: width 0.3s ease;
        }
        .nav-link-minimal:hover::after {
          width: 80%;
        }
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          max-width: 320px;
          height: 100vh;
          background: white;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          transition: right 0.3s ease;
          z-index: 1050;
        }
        .mobile-menu.open {
          right: 0;
        }
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1040;
        }
        .mobile-overlay.open {
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      <nav className="navbar-minimal fixed-top" style={{
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: scrolled ? '0.75rem 0' : '1rem 0',
        zIndex: 1030
      }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <a href="/" className="d-flex align-items-center gap-3 text-decoration-none">
              <div className="rounded-3 p-2" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <span className="fw-bold fs-4" style={{ color: '#0f172a' }}>
                PharmaSentinel
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="d-none d-lg-flex align-items-center gap-1">
              {navLinks.map((link, i) => (
                <a key={i} href={link.path} className="nav-link-minimal">
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Section */}
            <div className="d-flex align-items-center gap-3">
              {user ? (
                <div className="d-none d-lg-flex align-items-center gap-3">
                  <button className="btn btn-link p-2 position-relative" style={{ color: '#64748b' }}>
                    <Bell style={{ width: '20px', height: '20px' }} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{
                      background: '#ef4444',
                      fontSize: '0.65rem'
                    }}>
                      3
                    </span>
                  </button>
                  <div className="dropdown">
                    <button className="btn d-flex align-items-center gap-2 dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#0f172a',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px'
                    }}>
                      <User style={{ width: '18px', height: '18px' }} />
                      <span className="small fw-medium">{user.username}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style={{
                      borderRadius: '12px',
                      padding: '0.5rem'
                    }}>
                      <li>
                        <a className="dropdown-item rounded-2" href={`/${user.role?.toLowerCase()}/notifications`}>
                          <Bell style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                          Notifications
                        </a>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item rounded-2 text-danger" onClick={logout}>
                          <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <a href="/login" className="btn d-none d-lg-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'white',
                  border: 'none'
                }}>
                  <User style={{ width: '18px', height: '18px' }} />
                  Login
                </a>
              )}

              {/* Mobile Menu Toggle */}
              <button className="btn d-lg-none p-2" onClick={() => setMobileMenuOpen(true)} style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#0f172a',
                borderRadius: '10px'
              }}>
                <Menu style={{ width: '24px', height: '24px' }} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-3 p-2" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span className="fw-bold fs-5" style={{ color: '#0f172a' }}>PharmaSentinel</span>
            </div>
            <button className="btn p-2" onClick={() => setMobileMenuOpen(false)} style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px'
            }}>
              <X style={{ width: '24px', height: '24px', color: '#0f172a' }} />
            </button>
          </div>

          {user && (
            <div className="mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                  color: 'white'
                }}>
                  <User style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <div className="fw-semibold" style={{ color: '#0f172a' }}>{user.username}</div>
                  <div className="small text-muted">{user.role}</div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex flex-column gap-2">
            {navLinks.map((link, i) => (
              <a key={i} href={link.path} className="p-3 rounded-3 text-decoration-none" style={{
                color: '#475569',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }} onMouseEnter={e => e.target.style.background = '#f8fafc'}
                 onMouseLeave={e => e.target.style.background = 'transparent'}>
                {link.name}
              </a>
            ))}
          </div>

          <div className="mt-4 pt-4 border-top">
            {user ? (
              <>
                <a href={`/${user.role?.toLowerCase()}/notifications`} className="btn w-100 mb-2 d-flex align-items-center justify-content-center gap-2" style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#0f172a',
                  padding: '0.75rem',
                  borderRadius: '10px'
                }}>
                  <Bell style={{ width: '18px', height: '18px' }} />
                  Notifications
                </a>
                <button onClick={logout} className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-danger" style={{
                  background: '#fef2f2',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px'
                }}>
                  <LogOut style={{ width: '18px', height: '18px' }} />
                  Logout
                </button>
              </>
            ) : (
              <a href="/login" className="btn w-100 d-flex align-items-center justify-content-center gap-2" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '10px'
              }}>
                <User style={{ width: '18px', height: '18px' }} />
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarComp;