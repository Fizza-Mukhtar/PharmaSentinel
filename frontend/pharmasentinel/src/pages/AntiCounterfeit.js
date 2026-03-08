import React from 'react';
import { QrCode, Shield, CheckCircle, AlertTriangle, Scan, Lock, Database, Zap } from 'lucide-react';

const AntiCounterfeit = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Verification',
      description: 'Instant authenticity checks via secure QR scanning with blockchain validation',
      color: '#3b82f6'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Tamper-proof records ensure medicine authenticity at every checkpoint',
      color: '#8b5cf6'
    },
    {
      icon: CheckCircle,
      title: 'Instant Validation',
      description: 'Real-time verification at point of sale or delivery within seconds',
      color: '#10b981'
    },
    {
      icon: AlertTriangle,
      title: 'Alert System',
      description: 'Immediate notifications for suspicious activities and counterfeit attempts',
      color: '#ef4444'
    }
  ];

  const protectionLayers = [
    { icon: Scan, title: 'Mobile Scanning', desc: 'Patient verification via smartphone' },
    { icon: Database, title: 'Blockchain Ledger', desc: 'Immutable record storage' },
    { icon: Lock, title: 'Encryption', desc: 'End-to-end data security' },
    { icon: Zap, title: 'Real-Time', desc: 'Instant authentication response' }
  ];

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '50vh'
      }}>
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        
        <div className="container position-relative py-5 text-white text-center">
          <div className="py-5">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">SOLUTION</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">Anti-Counterfeit Protection</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Protect patients and your brand from fake medicines with advanced verification technology
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-4">
            {features.map((feature, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="h-100 bg-white rounded-4 p-4 border text-center" style={{
                  transition: 'all 0.3s ease'
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}>
                  <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{
                    width: '80px',
                    height: '80px',
                    background: `${feature.color}15`
                  }}>
                    <feature.icon style={{ width: '36px', height: '36px', color: feature.color }} />
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{feature.title}</h5>
                  <p className="text-muted small mb-0" style={{ lineHeight: '1.7' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Layers */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Multi-Layer Security</h2>
            <p className="fs-5" style={{ color: '#cbd5e1' }}>Comprehensive protection against counterfeit medicines</p>
          </div>

          <div className="row g-4">
            {protectionLayers.map((layer, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <layer.icon style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h6 className="fw-bold mb-2">{layer.title}</h6>
                  <p className="small mb-0" style={{ color: '#94a3b8' }}>{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="rounded-4 p-5 text-center" style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield style={{ width: '150px', height: '150px', color: '#64748b', opacity: 0.5 }} />
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#0f172a' }}>
                Stop Counterfeit Medicines
              </h2>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Counterfeit medicines pose a serious threat to patient safety and brand reputation. PharmaSentinel's 
                anti-counterfeit solution uses blockchain technology and unique QR codes to ensure every medicine 
                is authentic.
              </p>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Patients, pharmacies, and regulators can instantly verify medicine authenticity by scanning QR codes 
                with their smartphones. All verification attempts are logged on the blockchain for complete transparency 
                and audit trails.
              </p>
              <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                border: 'none'
              }}>
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-4 text-center">
            {[
              { value: '99.9%', label: 'Accuracy Rate', color: '#10b981' },
              { value: '<2s', label: 'Scan Speed', color: '#3b82f6' },
              { value: '100%', label: 'Blockchain Security', color: '#8b5cf6' },
              { value: '24/7', label: 'Monitoring', color: '#f59e0b' }
            ].map((stat, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="rounded-4 p-4 border">
                  <div className="display-3 fw-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-muted fw-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AntiCounterfeit;