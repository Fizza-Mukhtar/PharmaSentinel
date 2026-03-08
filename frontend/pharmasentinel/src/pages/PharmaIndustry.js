// src/pages/PharmaIndustry.js
import React from "react";

const PharmaIndustry = () => {
  const benefits = [
    {
      icon: "fas fa-industry",
      title: "For Manufacturers",
      points: ["Protect brand reputation", "Reduce counterfeiting", "Ensure compliance", "Track distribution"]
    },
    {
      icon: "fas fa-warehouse",
      title: "For Distributors",
      points: ["Real-time inventory", "Automated verification", "Reduce fraud", "Streamlined operations"]
    },
    {
      icon: "fas fa-store",
      title: "For Pharmacies",
      points: ["Verify authenticity", "Manage stock", "Patient safety", "Regulatory compliance"]
    },
    {
      icon: "fas fa-user-md",
      title: "For Patients",
      points: ["Medicine verification", "Complete transparency", "Safety assurance", "Counterfeit protection"]
    }
  ];

  return (
    <div style={{ paddingTop: '80px', background: '#fff' }}>
      {/* Hero */}
      <section style={{ 
        minHeight: '50vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '4rem 1rem' 
      }}>
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <span style={{ 
            display: 'inline-block', 
            background: 'rgba(255, 255, 255, 0.15)', 
            padding: '0.6rem 1.5rem', 
            borderRadius: '50px', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <i className="fas fa-pills me-2"></i>
            INDUSTRY
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1rem' }}>
            Pharmaceutical Industry
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', maxWidth: '700px', margin: '0 auto', opacity: 0.95 }}>
            Comprehensive blockchain solutions for the entire pharmaceutical ecosystem
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '5rem 1rem', background: 'white' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '1rem' }}>
              Benefits for Every Stakeholder
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>
              PharmaSentinel serves the entire pharmaceutical supply chain
            </p>
          </div>
          <div className="row g-4">
            {benefits.map((benefit, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div style={{ 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '20px', 
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  height: '100%'
                }}>
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    borderRadius: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '1.5rem', 
                    fontSize: '1.8rem', 
                    color: 'white' 
                  }}>
                    <i className={benefit.icon}></i>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1.5rem' }}>
                    {benefit.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {benefit.points.map((point, pIdx) => (
                      <li key={pIdx} style={{ 
                        fontSize: '0.95rem', 
                        color: '#6c757d', 
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <i className="fas fa-check-circle" style={{ color: '#667eea', fontSize: '0.9rem' }}></i>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Challenge */}
      <section style={{ padding: '5rem 1rem', background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div style={{ 
                borderRadius: '25px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '3rem',
                textAlign: 'center',
                minHeight: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <i className="fas fa-pills" style={{ fontSize: '6rem', color: '#667eea', opacity: 0.4 }}></i>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '1.5rem' }}>
                Addressing Industry Challenges
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#6c757d', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                The pharmaceutical industry faces significant challenges from counterfeit medicines, supply chain 
                inefficiencies, and regulatory compliance requirements. These issues put patient safety at risk and 
                cost the industry billions annually.
              </p>
              <p style={{ fontSize: '1.05rem', color: '#6c757d', lineHeight: '1.8', marginBottom: '2rem' }}>
                PharmaSentinel addresses these challenges head-on with blockchain technology, providing a secure, 
                transparent, and efficient solution that benefits every stakeholder in the pharmaceutical ecosystem.
              </p>
              <a href="/contact" className="btn" style={{
                padding: '1rem 2.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '50px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                <i className="fas fa-envelope me-2"></i>
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PharmaIndustry;