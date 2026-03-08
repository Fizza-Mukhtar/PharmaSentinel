import React from 'react';
import { Target, Eye, Heart, Code, FlaskConical, ShieldCheck, Users, Globe, Calendar, Package } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      text: "Eliminate counterfeit medicines from the pharmaceutical supply chain through cutting-edge blockchain technology and transparent tracking systems."
    },
    {
      icon: Eye,
      title: "Our Vision",
      text: "A world where every patient receives authentic, safe medicines with complete visibility from manufacturer to end consumer."
    },
    {
      icon: Heart,
      title: "Our Values",
      text: "Trust, transparency, innovation, and patient safety drive everything we do in building a secure pharmaceutical ecosystem."
    }
  ];

  const team = [
    {
      icon: Code,
      role: "Technology",
      description: "Blockchain experts and software engineers building secure, scalable solutions",
      color: "#475569"
    },
    {
      icon: FlaskConical,
      role: "Pharmaceutical",
      description: "Industry veterans ensuring compliance and practical implementation",
      color: "#64748b"
    },
    {
      icon: ShieldCheck,
      role: "Security",
      description: "Cybersecurity specialists protecting data integrity at every level",
      color: "#334155"
    }
  ];

  const stats = [
    { number: "2019", label: "Founded", icon: Calendar },
    { number: "50+", label: "Team Members", icon: Users },
    { number: "15+", label: "Countries", icon: Globe },
    { number: "10M+", label: "Medicines Tracked", icon: Package }
  ];

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '60vh'
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
              <Users style={{ width: '16px', height: '16px' }} />
              <span className="small">About PharmaSentinel</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">
              Protecting Lives Through
              <span className="d-block mt-2" style={{
                background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Blockchain Innovation
              </span>
            </h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '700px', color: '#cbd5e1' }}>
              Leading the pharmaceutical industry transformation with blockchain-powered 
              medicine authentication and supply chain transparency
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white" style={{ marginTop: '-3rem', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="row g-4">
            {stats.map((stat, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="bg-white rounded-4 p-4 text-center border shadow-sm h-100">
                  <stat.icon style={{ width: '48px', height: '48px', color: '#475569', marginBottom: '1rem' }} />
                  <div className="display-4 fw-bold mb-2" style={{ color: '#0f172a' }}>{stat.number}</div>
                  <div className="text-muted fw-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, white 0%, #f8fafc 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="rounded-4 p-5 text-center" style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                border: '1px solid #cbd5e1'
              }}>
                <ShieldCheck style={{ width: '120px', height: '120px', color: '#475569', opacity: 0.6 }} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="d-inline-block px-4 py-2 rounded-pill mb-4" style={{
                background: '#f1f5f9',
                color: '#475569'
              }}>
                <span className="small fw-semibold">Our Story</span>
              </div>
              
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#0f172a' }}>
                Building Trust in Healthcare
              </h2>
              
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                PharmaSentinel was founded in 2019 by a team of healthcare professionals, blockchain 
                engineers, and supply chain experts who witnessed firsthand the devastating impact of 
                counterfeit medicines on patients worldwide.
              </p>
              
              <p className="fs-6 text-muted mb-4" style={{ lineHeight: '1.8' }}>
                We recognized that traditional tracking methods were insufficient to combat sophisticated 
                counterfeiters. By leveraging blockchain's immutable ledger and creating an ecosystem of 
                verified stakeholders, we've built a solution that brings unprecedented transparency to 
                pharmaceutical supply chains.
              </p>
              
              <p className="fs-6 text-muted" style={{ lineHeight: '1.8' }}>
                Today, we collaborate with regulators, manufacturers, distributors, and retailers across 
                multiple continents, providing end-to-end traceability and protecting millions of patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{
              background: '#f1f5f9',
              color: '#475569'
            }}>
              <span className="small fw-semibold">Our Foundation</span>
            </div>
            <h2 className="display-5 fw-bold" style={{ color: '#0f172a' }}>What Drives Us</h2>
          </div>
          
          <div className="row g-4">
            {values.map((value, i) => (
              <div key={i} className="col-md-4">
                <div className="h-100 rounded-4 p-5 text-center" style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)'
                  }}>
                    <value.icon style={{ width: '40px', height: '40px', color: 'white' }} />
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{value.title}</h5>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.7' }}>{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{
              background: '#f1f5f9',
              color: '#475569'
            }}>
              <span className="small fw-semibold">Our Team</span>
            </div>
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Multidisciplinary Expertise
            </h2>
            <p className="fs-5 text-muted">
              Combining deep industry knowledge with cutting-edge technology
            </p>
          </div>
          
          <div className="row g-4">
            {team.map((member, i) => (
              <div key={i} className="col-md-4">
                <div className="bg-white rounded-4 p-4 border h-100">
                  <div className="rounded-3 p-3 d-inline-flex mb-4" style={{ background: member.color }}>
                    <member.icon style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{member.role}</h5>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.7' }}>{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-white text-center" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      }}>
        <div className="container py-5">
          <h2 className="display-5 fw-bold mb-4">Join the Movement</h2>
          <p className="fs-5 mb-5" style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Partner with us to create a safer pharmaceutical supply chain
          </p>
          <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
            background: 'white',
            color: '#1e293b',
            border: 'none'
          }}>
            Get In Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;