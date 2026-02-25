import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import { ShieldCheck, BookOpen, Users, ArrowRight, Star, Award, FileText, Zap } from 'lucide-react';

const Services = () => {
    return (
        <>
            {/* Hero */}
            <Section style={{ backgroundColor: 'var(--bg-dark)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '12px' }}>Professional Services</h1>
                    <p style={{ fontSize: '1.2rem', color: '#CBD5E0', maxWidth: '750px', margin: '0 auto' }}>
                        We empower organizations with independent product reviews, governance playbooks, and expert-led workshops — so you can implement AI risk management at your own pace.
                    </p>
                </div>
            </Section>

            {/* Services Grid */}
            <Section style={{ padding: '4rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                    {/* Product Review */}
                    <div style={{
                        border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default'
                    }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ background: 'linear-gradient(135deg, #003366, #0055aa)', padding: '30px 24px', color: 'white' }}>
                            <ShieldCheck size={36} style={{ marginBottom: '12px' }} />
                            <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: 'white' }}>Product Review</h2>
                            <p style={{ margin: 0, color: '#93C5FD', fontSize: '0.95rem' }}>Independent security assessments by expert reviewers</p>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                                Our council of paid members, executives, and industry specialists rigorously evaluate AI and cybersecurity products. Each review includes detailed security posture analysis, star ratings, and actionable findings.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                {['Hands-on security testing by certified reviewers', 'Star ratings with detailed assessment breakdown', 'Coverage of enterprise tools: EDR, SIEM, Cloud Security', 'Updated quarterly as products release new versions'].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <Star size={14} color="#F59E0B" fill="#F59E0B" style={{ flexShrink: 0, marginTop: '3px' }} /> {f}
                                    </div>
                                ))}
                            </div>
                            <Link to="/services/product-reviews" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                backgroundColor: 'var(--primary)', color: 'white',
                                padding: '12px 24px', borderRadius: '8px', textDecoration: 'none',
                                fontWeight: 'bold', fontSize: '0.95rem', transition: 'background 0.2s'
                            }}>
                                View Product Reviews <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Executive Workshops */}
                    <div style={{
                        border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default'
                    }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', padding: '30px 24px', color: 'white' }}>
                            <Users size={36} style={{ marginBottom: '12px' }} />
                            <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: 'white' }}>Executive Workshops</h2>
                            <p style={{ margin: 0, color: '#93C5FD', fontSize: '0.95rem' }}>Intensive training for leadership teams</p>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                                Half-day and full-day facilitator-led sessions designed for Board Directors and C-Suite leaders. Build AI governance competency, run crisis simulations, and develop practical compliance roadmaps.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                {['AI Governance Fundamentals for the Board', 'Live crisis simulation tabletop exercises', 'Regulatory readiness: EU AI Act, NIST AI RMF', 'CPE credits and certification of completion'].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <Zap size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} /> {f}
                                    </div>
                                ))}
                            </div>
                            <Link to="/services/workshops" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                backgroundColor: 'var(--primary)', color: 'white',
                                padding: '12px 24px', borderRadius: '8px', textDecoration: 'none',
                                fontWeight: 'bold', fontSize: '0.95rem', transition: 'background 0.2s'
                            }}>
                                View Workshop Details <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Why Us */}
            <Section style={{ padding: '4rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Why Choose AI Risk Council?</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        We don't sell consultancy — we give you the tools and knowledge to manage AI risk independently.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    {[
                        { icon: <Award size={28} color="var(--primary)" />, title: 'Independent Reviews', desc: 'Our product assessments are unbiased and written by vetted industry practitioners, not vendors.' },
                        { icon: <FileText size={28} color="var(--primary)" />, title: 'Self-Service Playbooks', desc: 'We provide ready-to-use governance templates and guides. No expensive consultants needed.' },
                        { icon: <Users size={28} color="var(--primary)" />, title: 'Expert Network', desc: 'Access to a global council of 500+ AI risk professionals across 40 countries.' },
                        { icon: <ShieldCheck size={28} color="var(--primary)" />, title: 'Framework Aligned', desc: 'All our resources are mapped to EU AI Act, NIST AI RMF, ISO 42001, and sector-specific requirements.' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
                            padding: '24px', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ marginBottom: '12px' }}>{item.icon}</div>
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-main)' }}>{item.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
};

export default Services;
