import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.message.length < 10) {
      setError('Message must be at least 10 characters');
      setLoading(false);
      return;
    }

    try {
      // EmailJS Integration - Dynamic import
      const emailjs = (await import('@emailjs/browser')).default;
      
      const serviceId = "service_47p301c";
      const templateId = "template_t08i7m7";
      const publicKey = "261PoN-uNW6QsYgHK";

      const templateParams = {
        name: formData.name,
        email: formData.email,
        message: formData.message
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Email send error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      info: 'nimrahk144@gmail.com',
      link: 'mailto:nimrahk144@gmail.com',
      color: '#3b82f6'
    },
    {
      icon: Phone,
      title: 'Call Us',
      info: '+92 300 1234567',
      link: 'tel:+923001234567',
      color: '#10b981'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      info: 'Karachi, Sindh, Pakistan',
      link: '#',
      color: '#f59e0b'
    }
  ];

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '40vh'
      }}>
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        
        <div className="container position-relative py-5 text-white text-center">
          <div className="py-4">
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Mail style={{ width: '16px', height: '16px' }} />
              <span className="small">Get In Touch</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4">Contact Us</h1>
            
            <p className="fs-5 mx-auto" style={{ maxWidth: '600px', color: '#cbd5e1' }}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-5" style={{ marginTop: '-3rem', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="row g-4">
            {contactInfo.map((item, i) => (
              <div key={i} className="col-md-4">
                <a href={item.link} className="text-decoration-none">
                  <div className="bg-white rounded-4 p-4 text-center border h-100 shadow-sm" style={{
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
                      background: `${item.color}15`
                    }}>
                      <item.icon style={{ width: '36px', height: '36px', color: item.color }} />
                    </div>
                    <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>{item.title}</h5>
                    <p className="text-muted mb-0">{item.info}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white rounded-4 p-4 p-md-5 border shadow-sm">
                <div className="text-center mb-5">
                  <h2 className="display-6 fw-bold mb-3" style={{ color: '#0f172a' }}>
                    Send Us a Message
                  </h2>
                  <p className="text-muted">
                    Fill out the form below and we'll get back to you within 24 hours
                  </p>
                </div>

                {success && (
                  <div className="rounded-3 p-4 mb-4 d-flex align-items-center gap-3" style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0'
                  }}>
                    <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0 }} />
                    <span style={{ color: '#15803d' }}>Thank you! We'll get back to you soon.</span>
                  </div>
                )}

                {error && (
                  <div className="rounded-3 p-4 mb-4 d-flex align-items-center gap-3" style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca'
                  }}>
                    <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626', flexShrink: 0 }} />
                    <span style={{ color: '#b91c1c' }}>{error}</span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <label className="fw-semibold mb-2 d-block" style={{ color: '#0f172a' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-100 rounded-3"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your full name"
                      style={{
                        border: '2px solid #e2e8f0',
                        padding: '0.875rem 1rem',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={e => e.target.style.borderColor = '#475569'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="fw-semibold mb-2 d-block" style={{ color: '#0f172a' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-100 rounded-3"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your email address"
                      style={{
                        border: '2px solid #e2e8f0',
                        padding: '0.875rem 1rem',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      onFocus={e => e.target.style.borderColor = '#475569'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="fw-semibold mb-2 d-block" style={{ color: '#0f172a' }}>
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      className="w-100 rounded-3"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      style={{
                        border: '2px solid #e2e8f0',
                        padding: '0.875rem 1rem',
                        fontSize: '1rem',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      onFocus={e => e.target.style.borderColor = '#475569'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <button 
                    onClick={handleSubmit}
                    className="w-100 d-flex align-items-center justify-content-center gap-2" 
                    disabled={loading}
                    style={{
                      background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      if (!loading) e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      if (!loading) e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '20px', height: '20px' }} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;