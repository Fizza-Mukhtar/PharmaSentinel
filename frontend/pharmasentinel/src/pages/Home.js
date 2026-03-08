import React, { useState, useEffect } from 'react';
import { Shield, Scan, Package, Lock, Users, Zap, ArrowRight, CheckCircle, Activity, Database, Globe, Smartphone, QrCode, Search, TrendingUp, AlertTriangle } from 'lucide-react';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "QR Verification",
      description: "Scan medicines instantly using your smartphone camera for real-time authentication",
      gradient: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
    },
    {
      icon: Database,
      title: "Blockchain Ledger",
      description: "Every transaction permanently recorded on distributed, tamper-proof blockchain",
      gradient: "linear-gradient(135deg, #334155 0%, #475569 100%)"
    },
    {
      icon: Activity,
      title: "Real-Time Tracking",
      description: "Monitor medicine journey from factory to pharmacy with live GPS coordinates",
      gradient: "linear-gradient(135deg, #475569 0%, #64748b 100%)"
    },
    {
      icon: Shield,
      title: "Counterfeit Protection",
      description: "Multi-layer security preventing fake medicines from entering supply chain",
      gradient: "linear-gradient(135deg, #64748b 0%, #1e293b 100%)"
    }
  ];

  const process = [
    { 
      step: "01", 
      title: "Manufacturing", 
      desc: "Unique blockchain ID assigned during production",
      icon: Package
    },
    { 
      step: "02", 
      title: "Distribution", 
      desc: "Every handoff logged with timestamp and location",
      icon: Activity
    },
    { 
      step: "03", 
      title: "Verification", 
      desc: "Pharmacies validate before stocking shelves",
      icon: CheckCircle
    },
    { 
      step: "04", 
      title: "Consumer Scan", 
      desc: "Patients verify authenticity via mobile app",
      icon: Smartphone
    }
  ];

  const stats = [
    { value: "99.9%", label: "Accuracy Rate", icon: CheckCircle, color: "#10b981" },
    { value: "<2s", label: "Scan Time", icon: Zap, color: "#f59e0b" },
    { value: "24/7", label: "Monitoring", icon: Globe, color: "#3b82f6" },
    { value: "100%", label: "Immutable", icon: Lock, color: "#8b5cf6" }
  ];

  const stakeholders = [
    {
      title: "Manufacturers",
      benefits: ["Brand protection", "Quality assurance", "Regulatory compliance", "Supply chain visibility"],
      icon: Package,
      color: "#475569"
    },
    {
      title: "Distributors",
      benefits: ["Automated tracking", "Fraud prevention", "Inventory management", "Audit trails"],
      icon: Activity,
      color: "#64748b"
    },
    {
      title: "Pharmacies",
      benefits: ["Product verification", "Stock authenticity", "Customer trust", "Recall management"],
      icon: Users,
      color: "#475569"
    },
    {
      title: "Patients",
      benefits: ["Scan before purchase", "Safety guarantee", "Complete transparency", "Report counterfeits"],
      icon: Smartphone,
      color: "#64748b"
    }
  ];

  return (
    <div className="bg-white" style={{ paddingTop: '80px' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Hero Section - Blockchain Dark Theme */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        minHeight: '90vh'
      }}>
        {/* Grid Pattern Background */}
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }} />
        
        {/* Animated Blockchain Blocks */}
        <div className="position-absolute w-100 h-100 top-0 start-0 overflow-hidden" style={{ opacity: 0.05 }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="position-absolute border border-white"
              style={{
                width: '120px',
                height: '120px',
                left: `${(i % 4) * 25}%`,
                top: `${Math.floor(i / 4) * 50}%`,
                animation: `float ${6 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6 text-white mb-5 mb-lg-0">
              <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Shield className="w-4 h-4" style={{ width: '18px', height: '18px' }} />
                <span className="small fw-medium">Blockchain-Powered Authentication</span>
              </div>
              
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                Verify Every Medicine
                <span className="d-block mt-2" style={{ 
                  background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  with Blockchain
                </span>
              </h1>
              
              <p className="fs-5 mb-4" style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
                Pharmaceutical supply chain protection using distributed ledger technology. 
                Patients scan QR codes to instantly verify medicine authenticity before purchase.
              </p>
              
              <div className="d-flex flex-wrap gap-3 mb-5">
                <a href="/login" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold d-inline-flex align-items-center gap-2" style={{
                  background: '#475569',
                  color: 'white',
                  border: 'none'
                }}>
                  Get Started
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </a>
                <a href="/contact" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  Contact Sales
                </a>
              </div>
              
              <div className="row g-4">
                {stats.map((stat, i) => (
                  <div key={i} className="col-6 col-md-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
                      <div className="fs-3 fw-bold">{stat.value}</div>
                    </div>
                    <div className="small" style={{ color: '#94a3b8' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Blockchain Visualization Card */}
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="rounded-4 p-4" style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style={{
                    borderColor: 'rgba(255,255,255,0.1) !important'
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 p-3" style={{ background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' }}>
                        <Database style={{ width: '28px', height: '28px', color: 'white' }} />
                      </div>
                      <div>
                        <div className="fw-bold text-white">Medicine Verified</div>
                        <div className="small" style={{ color: '#94a3b8' }}>Batch #MED-2026-4521</div>
                      </div>
                    </div>
                    <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
                  </div>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="small" style={{ color: '#94a3b8' }}>Manufacturer</div>
                      <div className="fw-medium text-white">PharmaCorp Ltd.</div>
                    </div>
                    <div className="col-6">
                      <div className="small" style={{ color: '#94a3b8' }}>Status</div>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle" style={{ width: '8px', height: '8px', background: '#10b981', animation: 'pulse 2s infinite' }} />
                        <span className="fw-medium" style={{ color: '#10b981' }}>Verified</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="small" style={{ color: '#94a3b8' }}>Mfg Date</div>
                      <div className="fw-medium text-white">Jan 15, 2026</div>
                    </div>
                    <div className="col-6">
                      <div className="small" style={{ color: '#94a3b8' }}>Expiry</div>
                      <div className="fw-medium text-white">Jan 15, 2028</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="small mb-2" style={{ color: '#94a3b8' }}>Supply Chain Journey</div>
                    <div className="d-flex align-items-center gap-2">
                      {['Manufacturer', 'Distributor', 'Warehouse', 'Pharmacy'].map((step, i) => (
                        <React.Fragment key={i}>
                          <div className="flex-fill rounded" style={{ height: '8px', background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' }} />
                          {i < 3 && <div className="rounded-circle" style={{ width: '12px', height: '12px', background: '#10b981' }} />}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      {['Manufacturer', 'Distributor', 'Warehouse', 'Pharmacy'].map((step, i) => (
                        <div key={i} className="small" style={{ color: '#64748b', fontSize: '0.7rem' }}>{step}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-3" style={{
              background: '#f1f5f9',
              color: '#475569'
            }}>
              <Zap style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">Core Capabilities</span>
            </div>
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Complete Authentication System
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Four powerful features working together to eliminate counterfeit medicines
            </p>
          </div>
          
          <div className="row g-4">
            {features.map((feature, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="h-100 bg-white rounded-4 p-4 border shadow-sm" style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}>
                  <div className="rounded-3 p-3 d-inline-flex mb-3" style={{ background: feature.gradient }}>
                    <feature.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{feature.title}</h5>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.7' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5" style={{ background: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-3" style={{
              background: '#f1f5f9',
              color: '#475569'
            }}>
              <TrendingUp style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">Process Flow</span>
            </div>
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              How PharmaSentinel Works
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Four simple steps from production to patient verification
            </p>
          </div>
          
          <div className="row g-4 position-relative">
            <div className="d-none d-lg-block position-absolute top-50 start-0 w-100" style={{
              height: '2px',
              background: 'linear-gradient(90deg, #cbd5e1 0%, #cbd5e1 100%)',
              zIndex: 0
            }} />
            
            {process.map((step, i) => (
              <div key={i} className="col-md-6 col-lg-3 position-relative" style={{ zIndex: 1 }}>
                <div className="text-center bg-white px-3">
                  <div className="rounded-4 p-4 d-inline-flex mb-3 mx-auto" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    boxShadow: '0 10px 30px rgba(30, 41, 59, 0.3)'
                  }}>
                    <step.icon style={{ width: '40px', height: '40px', color: 'white' }} />
                  </div>
                  <div className="rounded-circle mx-auto mb-3 d-inline-flex align-items-center justify-content-center fw-bold" style={{
                    width: '40px',
                    height: '40px',
                    background: '#475569',
                    color: 'white'
                  }}>
                    {step.step}
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{step.title}</h5>
                  <p className="text-muted small">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-3" style={{
              background: '#f1f5f9',
              color: '#475569'
            }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">For Everyone</span>
            </div>
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Benefits for All Stakeholders
            </h2>
            <p className="fs-5 text-muted">
              From factory floor to pharmacy shelf to patient's hand
            </p>
          </div>
          
          <div className="row g-4">
            {stakeholders.map((group, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="h-100 bg-white rounded-4 p-4 border">
                  <div className="rounded-3 p-3 d-inline-flex mb-3" style={{ background: group.color }}>
                    <group.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>{group.title}</h5>
                  <ul className="list-unstyled">
                    {group.benefits.map((benefit, j) => (
                      <li key={j} className="d-flex align-items-start gap-2 mb-3">
                        <CheckCircle style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <span className="text-muted small">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Stats */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-3" style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5'
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              <span className="small fw-semibold">Global Crisis</span>
            </div>
            <h2 className="display-5 fw-bold mb-3">The Counterfeit Problem</h2>
            <p className="fs-5" style={{ color: '#cbd5e1' }}>
              Why blockchain authentication is critical
            </p>
          </div>
          
          <div className="row g-4 text-center">
            {[
              { value: '10-30%', label: 'of medicines in developing countries are counterfeit', icon: AlertTriangle, color: '#ef4444' },
              { value: '1M+', label: 'deaths annually from fake medicines worldwide', icon: AlertTriangle, color: '#dc2626' },
              { value: '$200B', label: 'global counterfeit drug market value per year', icon: TrendingUp, color: '#f59e0b' },
              { value: '99.9%', label: 'accuracy with PharmaSentinel verification', icon: CheckCircle, color: '#10b981' }
            ].map((stat, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="rounded-4 p-4" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <stat.icon style={{ width: '48px', height: '48px', color: stat.color, marginBottom: '1rem' }} />
                  <div className="display-4 fw-bold mb-2">{stat.value}</div>
                  <div className="small" style={{ color: '#94a3b8' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #334155 0%, #475569 100%)', color: 'white' }}>
        <div className="container py-5 text-center">
          <h2 className="display-4 fw-bold mb-4">Ready to Secure Your Supply Chain?</h2>
          <p className="fs-5 mb-5" style={{ color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Join pharmaceutical companies worldwide in protecting patients from counterfeit medicines
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <a href="/login" className="btn btn-lg px-5 py-3 rounded-3 fw-semibold" style={{
              background: 'white',
              color: '#334155',
              border: 'none'
            }}>
              Start Free Trial
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

export default Home;