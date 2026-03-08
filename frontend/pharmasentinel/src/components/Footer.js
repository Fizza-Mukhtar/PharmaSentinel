import React from 'react';
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ChevronRight } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/howitworks' },
      { name: 'Contact', path: '/contact' }
    ],
    solutions: [
      { name: 'Traceability', path: '/traceability' },
      { name: 'Anti-Counterfeit', path: '/anticounterfeit' },
      { name: 'Supply Chain', path: '/supplychain' },
      { name: 'Pharma Industry', path: '/pharmaindustry' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: '#3b5998' },
    { icon: Twitter, href: '#', color: '#1da1f2' },
    { icon: Linkedin, href: '#', color: '#0077b5' },
    { icon: Instagram, href: '#', color: '#e4405f' }
  ];

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      marginTop: '5rem'
    }}>
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-5">
          <div className="row g-4 py-4">
            {/* Brand Section */}
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-3 p-2" style={{
                  background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <span className="fw-bold fs-4">PharmaSentinel</span>
              </div>
              <p className="mb-4" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                Ensuring medicine authenticity with blockchain-powered traceability and QR-based verification. 
                Protecting patients worldwide.
              </p>
              
              {/* Social Links */}
              <div className="d-flex gap-3">
                {socialLinks.map((social, i) => (
                  <a key={i} href={social.href} className="rounded-circle d-flex align-items-center justify-content-center" style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }} onMouseEnter={e => {
                    e.currentTarget.style.background = social.color;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }} onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <social.icon style={{ width: '18px', height: '18px' }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-4">
              <h6 className="fw-bold mb-4">Company</h6>
              <ul className="list-unstyled">
                {footerLinks.company.map((link, i) => (
                  <li key={i} className="mb-3">
                    <a href={link.path} className="d-flex align-items-center gap-2 text-decoration-none" style={{
                      color: '#94a3b8',
                      transition: 'all 0.3s ease'
                    }} onMouseEnter={e => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.paddingLeft = '8px';
                    }} onMouseLeave={e => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div className="col-lg-3 col-md-4">
              <h6 className="fw-bold mb-4">Solutions</h6>
              <ul className="list-unstyled">
                {footerLinks.solutions.map((link, i) => (
                  <li key={i} className="mb-3">
                    <a href={link.path} className="d-flex align-items-center gap-2 text-decoration-none" style={{
                      color: '#94a3b8',
                      transition: 'all 0.3s ease'
                    }} onMouseEnter={e => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.paddingLeft = '8px';
                    }} onMouseLeave={e => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.paddingLeft = '0';
                    }}>
                      <ChevronRight style={{ width: '16px', height: '16px' }} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-4">
              <h6 className="fw-bold mb-4">Contact Us</h6>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-start gap-3">
                  <Mail style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                  <a href="mailto:support@pharmasentinel.com" className="text-decoration-none" style={{ color: '#94a3b8' }}>
                    support@pharmasentinel.com
                  </a>
                </li>
                <li className="mb-3 d-flex align-items-start gap-3">
                  <Phone style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                  <a href="tel:+923001234567" className="text-decoration-none" style={{ color: '#94a3b8' }}>
                    +92 300 1234567
                  </a>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <MapPin style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#94a3b8' }}>
                    Karachi, Sindh, Pakistan
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.1) !important' }}>
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0 small" style={{ color: '#64748b' }}>
                © {new Date().getFullYear()} PharmaSentinel. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-4 justify-content-center justify-content-md-end">
                {footerLinks.legal.map((link, i) => (
                  <a key={i} href={link.path} className="small text-decoration-none" style={{
                    color: '#64748b',
                    transition: 'color 0.3s ease'
                  }} onMouseEnter={e => e.currentTarget.style.color = 'white'}
                     onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;