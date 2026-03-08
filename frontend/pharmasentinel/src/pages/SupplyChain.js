import React from 'react';
import { Network, RefreshCw, TrendingUp, Settings, Package, Users, BarChart3, Clock } from 'lucide-react';

const SupplyChain = () => {
  const features = [
    {
      icon: Network,
      title: 'Connected Network',
      description: 'All stakeholders connected on single blockchain platform for seamless collaboration',
      color: '#3b82f6'
    },
    {
      icon: RefreshCw,
      title: 'Automated Updates',
      description: 'Real-time synchronization across entire supply chain with instant notifications',
      color: '#10b981'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Comprehensive insights into supply chain efficiency and bottleneck identification',
      color: '#f59e0b'
    },
    {
      icon: Settings,
      title: 'Smart Contracts',
      description: 'Automated compliance and verification workflows reducing manual intervention',
      color: '#8b5cf6'
    }
  ];

  const benefits = [
    { icon: Package, title: 'Inventory Management', desc: 'Real-time stock tracking' },
    { icon: Users, title: 'Stakeholder Coordination', desc: 'Seamless communication' },
    { icon: BarChart3, title: 'Data Analytics', desc: 'Actionable insights' },
    { icon: Clock, title: 'Time Efficiency', desc: 'Faster deliveries' }
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
              <Package style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">SOLUTION</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">Supply Chain Management</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Optimize your pharmaceutical supply chain with blockchain-powered transparency and efficiency
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

      {/* Benefits Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Key Benefits
            </h2>
            <p className="fs-5 text-muted">Transforming pharmaceutical logistics</p>
          </div>

          <div className="row g-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4 border h-100 bg-white">
                  <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{
                    width: '70px',
                    height: '70px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  }}>
                    <benefit.icon style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                  <h6 className="fw-bold mb-2" style={{ color: '#0f172a' }}>{benefit.title}</h6>
                  <p className="text-muted small mb-0">{benefit.desc}</p>
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
                Streamlined Operations
              </h2>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                PharmaSentinel revolutionizes pharmaceutical supply chain management by connecting all stakeholders 
                on a single blockchain platform. From manufacturers to patients, everyone benefits from real-time 
                visibility and automated workflows.
              </p>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Smart contracts automate compliance checks, reduce paperwork, and ensure every transaction meets 
                regulatory requirements. The result is a faster, more efficient supply chain with reduced costs 
                and improved patient safety.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  color: 'white',
                  border: 'none'
                }}>
                  Get Started
                </a>
                <a href="/about" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                  background: 'transparent',
                  color: '#1e293b',
                  border: '2px solid #1e293b'
                }}>
                  Learn More
                </a>
              </div>
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
                <Network style={{ width: '150px', height: '150px', color: '#64748b', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <div className="container py-5">
          <div className="row g-4 text-center">
            {[
              { value: '40%', label: 'Cost Reduction' },
              { value: '60%', label: 'Faster Processing' },
              { value: '95%', label: 'Compliance Rate' },
              { value: '100%', label: 'Transparency' }
            ].map((stat, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="rounded-4 p-4" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div className="display-3 fw-bold mb-2">{stat.value}</div>
                  <div style={{ color: '#cbd5e1' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupplyChain;