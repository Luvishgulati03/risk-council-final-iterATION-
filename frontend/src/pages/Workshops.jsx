import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import { ArrowLeft, Calendar, Users, Award, Clock, BookOpen, Target, Zap } from 'lucide-react';

const workshopTypes = [
    {
        title: 'AI Governance Fundamentals',
        duration: 'Half-day (4 hours)',
        audience: 'Board Directors, C-Suite, Senior Leadership',
        icon: <BookOpen size={28} color="var(--primary)" />,
        description: 'A foundational session that builds board-level AI fluency. Participants learn to define risk appetite, establish oversight structures, and set the strategic direction for responsible AI adoption.',
        topics: [
            'Understanding the AI risk landscape',
            'Defining organizational AI risk appetite',
            'Board fiduciary duties for AI oversight',
            'Building an AI governance charter',
            'Key frameworks: EU AI Act, NIST AI RMF, ISO 42001'
        ]
    },
    {
        title: 'AI Crisis Simulation',
        duration: 'Full-day (8 hours)',
        audience: 'Risk Officers, Incident Response Teams, IT Leaders',
        icon: <Zap size={28} color="#DC2626" />,
        description: 'An immersive tabletop exercise simulating real-world AI failure scenarios — from biased hiring algorithms to adversarial attacks on production models. Teams practice incident response in a safe, facilitated environment.',
        topics: [
            'Simulated bias event in a customer-facing AI system',
            'Model poisoning and adversarial attack response',
            'Regulatory notification and communication drills',
            'Post-incident analysis and remediation planning',
            'Updating playbooks based on lessons learned'
        ]
    },
    {
        title: 'Responsible AI Controls & Testing',
        duration: 'Full-day (8 hours)',
        audience: 'ML Engineers, Data Scientists, QA Leads, Compliance Teams',
        icon: <Target size={28} color="#059669" />,
        description: 'A deep technical session on implementing and validating AI controls. Covers model testing methodologies, bias detection tooling, explainability techniques, and continuous monitoring setup.',
        topics: [
            'Model validation and testing frameworks',
            'Bias detection and fairness metrics implementation',
            'Explainability techniques (SHAP, LIME, counterfactuals)',
            'Automated drift detection and alerting',
            'Building continuous monitoring dashboards'
        ]
    },
    {
        title: 'Regulatory Readiness Bootcamp',
        duration: 'Full-day (8 hours)',
        audience: 'Legal, Compliance, DPOs, Policy Teams',
        icon: <Award size={28} color="#7C3AED" />,
        description: 'An intensive session mapping your organization\'s AI portfolio against current and upcoming regulations. Participants leave with a concrete compliance roadmap and gap analysis.',
        topics: [
            'EU AI Act deep-dive: obligations by risk tier',
            'NIST AI RMF practical implementation',
            'ISO 42001 certification pathway',
            'Cross-border regulatory considerations',
            'Building a compliance evidence trail'
        ]
    }
];

const Workshops = () => {
    return (
        <>
            <Section style={{ backgroundColor: 'var(--bg-dark)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <Link to="/services" style={{ color: '#93C5FD', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Back to Services
                    </Link>
                    <h1 style={{ color: 'white', marginBottom: '10px' }}>Executive Workshops</h1>
                    <p style={{ fontSize: '1.15rem', color: '#CBD5E0', maxWidth: '700px', margin: '0 auto' }}>
                        Intensive, facilitator-led sessions designed for leadership teams. Build AI governance competency, practice crisis response, and develop actionable compliance roadmaps.
                    </p>
                </div>
            </Section>

            {/* Quick Stats */}
            <Section style={{ padding: '2.5rem 0', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    {[
                        { icon: <Calendar size={28} color="var(--primary)" />, label: 'Quarterly Workshops', value: '4 per year' },
                        { icon: <Users size={28} color="var(--primary)" />, label: 'Maximum Cohort', value: '25 attendees' },
                        { icon: <Clock size={28} color="var(--primary)" />, label: 'Duration Options', value: 'Half / Full day' },
                        { icon: <Award size={28} color="var(--primary)" />, label: 'Certificate', value: 'CPE credits' }
                    ].map((stat, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            {stat.icon}
                            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{stat.value}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Workshop Cards */}
            <Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                    {workshopTypes.map((w, idx) => (
                        <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
                            onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
                            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                            <div style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ background: '#F0F9FF', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
                                    {w.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: 'var(--text-main)' }}>{w.title}</h3>
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={13} /> {w.duration}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={13} /> {w.audience}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 16px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{w.description}</p>
                                    <div style={{ background: '#FAFAFA', borderRadius: '8px', padding: '14px' }}>
                                        <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Key Topics</p>
                                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {w.topics.map((t, i) => (
                                                <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                    <span style={{ color: 'var(--primary)', marginTop: '4px', flexShrink: 0 }}>•</span> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* CTA Section */}
            <Section style={{ background: 'var(--bg-dark)', color: 'white', textAlign: 'center' }}>
                <h2 style={{ color: 'white', marginBottom: '12px' }}>Ready to Upskill Your Leadership?</h2>
                <p style={{ color: '#CBD5E0', maxWidth: '600px', margin: '0 auto 24px', fontSize: '1.05rem' }}>
                    Contact us to schedule a private workshop for your organisation or register for our next open cohort.
                </p>
                <Link to="/contact" style={{
                    display: 'inline-block', backgroundColor: 'white', color: 'var(--primary)',
                    padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none',
                    fontSize: '1rem', transition: 'transform 0.2s'
                }}>
                    Request Workshop Details
                </Link>
            </Section>
        </>
    );
};

export default Workshops;
