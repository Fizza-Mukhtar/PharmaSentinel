import React from 'react';
import { Factory, Warehouse, Store, UserCheck, CheckCircle, Package, Users, Shield, Building } from 'lucide-react';

const PharmaIndustry = () => {
  const benefits = [
    {
      icon: Factory,
      title: 'For Manufacturers',
      points: ['Protect brand reputation', 'Reduce counterfeiting', 'Ensure compliance', 'Track distribution'],
      color: '#3b82f6'
    },
    {
      icon: Warehouse,
      title: 'For Distributors',
      points: ['Real-time inventory', 'Automated verification', 'Reduce fraud', 'Streamlined operations'],
      color: '#10b981'
    },
    {
      icon: Store,
      title: 'For Pharmacies',
      points: ['Verify authenticity', 'Manage stock', 'Patient safety', 'Regulatory compliance'],
      color: '#f59e0b'
    },
    {
      icon: UserCheck,
      title: 'For Patients',
      points: ['Medicine verification', 'Complete transparency', 'Safety assurance', 'Counterfeit protection'],
      color: '#8b5cf6'
    }
  ];

  const challenges = [
    { title: 'Counterfeit Crisis', stat: '$200B', desc: 'Annual counterfeit drug market' },
    { title: 'Patient Deaths', stat: '1M+', desc: 'Deaths from fake medicines yearly' },
    { title: 'Developing Nations', stat: '10-30%', desc: 'Medicines are counterfeit' },
    { title: 'Our Solution', stat: '99.9%', desc: 'Verification accuracy rate' }
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
              <Building style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">INDUSTRY</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">Pharmaceutical Industry</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Comprehensive blockchain solutions for the entire pharmaceutical ecosystem
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Benefits for Every Stakeholder
            </h2>
            <p className="fs-5 text-muted">PharmaSentinel serves the entire pharmaceutical supply chain</p>
          </div>

          <div className="row g-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="h-100 bg-white rounded-4 p-4 border">
                  <div className="rounded-3 p-3 d-inline-flex mb-4" style={{
                    background: `${benefit.color}15`
                  }}>
                    <benefit.icon style={{ width: '32px', height: '32px', color: benefit.color }} />
                  </div>
                  <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>{benefit.title}</h5>
                  <ul className="list-unstyled mb-0">
                    {benefit.points.map((point, j) => (
                      <li key={j} className="d-flex align-items-start gap-2 mb-3">
                        <CheckCircle style={{ width: '18px', height: '18px', color: benefit.color, flexShrink: 0, marginTop: '2px' }} />
                        <span className="text-muted small">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge Stats */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Industry Challenges</h2>
            <p className="fs-5" style={{ color: '#cbd5e1' }}>Understanding the global counterfeit medicine crisis</p>
          </div>

          <div className="row g-4 text-center">
            {challenges.map((challenge, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="rounded-4 p-4 h-100" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div className="display-3 fw-bold mb-3">{challenge.stat}</div>
                  <h6 className="fw-bold mb-2">{challenge.title}</h6>
                  <p className="small mb-0" style={{ color: '#94a3b8' }}>{challenge.desc}</p>
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
                <Package style={{ width: '150px', height: '150px', color: '#64748b', opacity: 0.5 }} />
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#0f172a' }}>
                Addressing Industry Challenges
              </h2>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                The pharmaceutical industry faces significant challenges from counterfeit medicines, supply chain 
                inefficiencies, and regulatory compliance requirements. These issues put patient safety at risk and 
                cost the industry billions annually.
              </p>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                PharmaSentinel addresses these challenges head-on with blockchain technology, providing a secure, 
                transparent, and efficient solution that benefits every stakeholder in the pharmaceutical ecosystem.
              </p>
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Our platform enables real-time collaboration between manufacturers, distributors, pharmacies, and 
                patients, creating a trustworthy supply chain from production to consumption.
              </p>
              <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                border: 'none'
              }}>
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Network Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Connected Ecosystem
            </h2>
            <p className="fs-5 text-muted">All stakeholders united on one platform</p>
          </div>

          <div className="row g-4">
            {[
              { icon: Factory, title: 'Manufacturers', count: '500+' },
              { icon: Warehouse, title: 'Distributors', count: '1,200+' },
              { icon: Store, title: 'Pharmacies', count: '5,000+' },
              { icon: Users, title: 'Patients Protected', count: '10M+' }
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4 border h-100">
                  <item.icon style={{ width: '48px', height: '48px', color: '#64748b', marginBottom: '1rem' }} />
                  <div className="display-6 fw-bold mb-2" style={{ color: '#0f172a' }}>{item.count}</div>
                  <div className="text-muted fw-medium">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PharmaIndustry;