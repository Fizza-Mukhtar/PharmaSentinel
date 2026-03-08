import React from 'react';
import { Package, Truck, Warehouse, Smartphone, Database, Shield, QrCode, CheckCircle, Activity, Zap } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Package,
      title: 'Manufacturing',
      description: 'Medicine is produced and assigned a unique blockchain ID. QR code is generated and attached to packaging.',
      details: ['Unique digital identity created', 'QR code linked to blockchain', 'Manufacturing data recorded', 'Quality control logged'],
      color: '#3b82f6'
    },
    {
      number: '02',
      icon: Truck,
      title: 'Distribution',
      description: 'Product moves through supply chain. Every handoff is recorded with timestamp, location, and digital signatures.',
      details: ['GPS tracking enabled', 'Transfer logged on blockchain', 'Temperature monitoring', 'Chain of custody verified'],
      color: '#10b981'
    },
    {
      number: '03',
      icon: Warehouse,
      title: 'Warehousing',
      description: 'Storage facilities scan and verify products. Inventory management integrated with blockchain ledger.',
      details: ['Batch verification', 'Storage conditions logged', 'Expiry tracking', 'Quality assurance checks'],
      color: '#f59e0b'
    },
    {
      number: '04',
      icon: Smartphone,
      title: 'Patient Verification',
      description: 'End consumer scans QR code with smartphone to instantly verify medicine authenticity before purchase.',
      details: ['Mobile app scanning', 'Instant verification', 'Complete history visible', 'Report suspicious products'],
      color: '#8b5cf6'
    }
  ];

  const technologies = [
    { icon: Database, title: 'Blockchain', desc: 'Distributed ledger technology' },
    { icon: QrCode, title: 'QR Codes', desc: 'Unique product identification' },
    { icon: Shield, title: 'Encryption', desc: 'End-to-end security' },
    { icon: Activity, title: 'IoT Sensors', desc: 'Real-time monitoring' }
  ];

  const benefits = [
    { icon: CheckCircle, title: 'Authenticity Guaranteed', desc: '99.9% verification accuracy' },
    { icon: Zap, title: 'Instant Verification', desc: 'Results in under 2 seconds' },
    { icon: Shield, title: 'Complete Security', desc: 'Tamper-proof blockchain records' },
    { icon: Activity, title: 'Real-Time Tracking', desc: '24/7 supply chain visibility' }
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
              <Activity style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">PROCESS</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">How It Works</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Simple, secure, and transparent verification from manufacturing to patient
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          {steps.map((step, i) => (
            <div key={i} className={`row align-items-center g-5 ${i % 2 === 0 ? '' : 'flex-row-reverse'} mb-5`}>
              <div className="col-lg-6">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{
                    width: '60px',
                    height: '60px',
                    background: `${step.color}15`,
                    color: step.color,
                    fontSize: '1.5rem'
                  }}>
                    {step.number}
                  </div>
                  <div className="rounded-3 p-3" style={{
                    background: `${step.color}15`
                  }}>
                    <step.icon style={{ width: '36px', height: '36px', color: step.color }} />
                  </div>
                </div>
                
                <h2 className="display-6 fw-bold mb-3" style={{ color: '#0f172a' }}>
                  {step.title}
                </h2>
                
                <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                  {step.description}
                </p>
                
                <ul className="list-unstyled">
                  {step.details.map((detail, j) => (
                    <li key={j} className="d-flex align-items-center gap-2 mb-2">
                      <CheckCircle style={{ width: '18px', height: '18px', color: step.color, flexShrink: 0 }} />
                      <span className="text-muted small">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="col-lg-6">
                <div className="rounded-4 p-5 text-center" style={{
                  background: `${step.color}08`,
                  border: `2px solid ${step.color}30`,
                  minHeight: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <step.icon style={{ width: '120px', height: '120px', color: step.color, opacity: 0.3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powered by Advanced Technology</h2>
            <p className="fs-5" style={{ color: '#cbd5e1' }}>Cutting-edge solutions for pharmaceutical security</p>
          </div>

          <div className="row g-4">
            {technologies.map((tech, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4 h-100" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <tech.icon style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h5 className="fw-bold mb-2">{tech.title}</h5>
                  <p className="small mb-0" style={{ color: '#94a3b8' }}>{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Why Choose PharmaSentinel?
            </h2>
            <p className="fs-5 text-muted">Comprehensive protection for patients and pharmaceutical companies</p>
          </div>

          <div className="row g-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4 border h-100" style={{
                  transition: 'all 0.3s ease'
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}>
                  <benefit.icon style={{ width: '48px', height: '48px', color: '#64748b', marginBottom: '1rem' }} />
                  <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{benefit.title}</h6>
                  <p className="text-muted small mb-0">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <div className="container py-5 text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
          <p className="fs-5 mb-5" style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join pharmaceutical companies worldwide in protecting patients from counterfeit medicines
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <a href="/login" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
              background: 'white',
              color: '#1e293b',
              border: 'none'
            }}>
              Get Started
            </a>
            <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;