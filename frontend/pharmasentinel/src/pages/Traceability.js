import React from 'react';
import { Route, Clock, Lock, Search, MapPin, CheckCircle, Database, Activity } from 'lucide-react';

const Traceability = () => {
  const features = [
    {
      icon: Route,
      title: 'End-to-End Tracking',
      description: 'Complete visibility from manufacturing to patient delivery with real-time updates',
      color: '#3b82f6'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Instant notifications at every supply chain checkpoint with timestamp verification',
      color: '#10b981'
    },
    {
      icon: Lock,
      title: 'Immutable Records',
      description: 'Blockchain ensures permanent, tamper-proof transaction logs for compliance',
      color: '#8b5cf6'
    },
    {
      icon: Search,
      title: 'Complete Audit Trail',
      description: 'Full history accessible for regulatory compliance and verification purposes',
      color: '#f59e0b'
    }
  ];

  const journey = [
    { icon: Database, label: 'Manufacturing', desc: 'Product created with unique ID' },
    { icon: MapPin, label: 'Distribution', desc: 'Movement logged with GPS data' },
    { icon: Activity, label: 'Warehousing', desc: 'Storage and quality checks' },
    { icon: CheckCircle, label: 'Delivery', desc: 'Final destination confirmed' }
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
              <Route style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">SOLUTION</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">Medicine Traceability</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Track every medicine from production to patient with blockchain-powered transparency
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

      {/* Supply Chain Journey */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Complete Supply Chain Visibility
            </h2>
            <p className="fs-5 text-muted">Every step tracked and verified on the blockchain</p>
          </div>

          <div className="row g-4 position-relative">
            <div className="d-none d-md-block position-absolute top-50 start-0 w-100" style={{
              height: '2px',
              background: 'linear-gradient(90deg, #cbd5e1 0%, #cbd5e1 100%)',
              zIndex: 0
            }} />

            {journey.map((step, i) => (
              <div key={i} className="col-md-6 col-lg-3 position-relative" style={{ zIndex: 1 }}>
                <div className="bg-white rounded-4 p-4 text-center border h-100">
                  <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  }}>
                    <step.icon style={{ width: '36px', height: '36px', color: 'white' }} />
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{step.label}</h6>
                  <p className="text-muted small mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#0f172a' }}>
                Real-Time Tracking & Monitoring
              </h2>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                PharmaSentinel's traceability solution provides unprecedented visibility into your pharmaceutical 
                supply chain. Every transaction is recorded on the blockchain, creating an immutable audit trail 
                from manufacturer to patient.
              </p>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                With real-time tracking and instant alerts, stakeholders can monitor medicine movement, verify 
                authenticity, and ensure compliance at every stage of the journey. GPS coordinates, timestamps, 
                and digital signatures create a complete chain of custody.
              </p>
              <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                border: 'none'
              }}>
                Contact Us
              </a>
            </div>
            <div className="col-lg-6">
              <div className="rounded-4 p-5 text-center" style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Route style={{ width: '150px', height: '150px', color: '#64748b', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Traceability;