import React, { useState } from 'react';
import Section from '../components/Section';
import { pillars } from '../mockData';
import { CheckCircle, AlertTriangle, FileText, ClipboardList, ChevronRight } from 'lucide-react';

// ─── Content for each section ─────────────────────────────────────────────────

const MATURITY_LEVELS = [
    {
        level: 1,
        name: 'Foundational',
        color: '#94A3B8',
        bg: '#F8FAFC',
        description: 'Ad-hoc risk management with no formal AI governance structure. Risks are addressed reactively and inconsistently.',
        characteristics: [
            'No dedicated AI risk policy or owner',
            'Model inventory non-existent or informal',
            'Risk assessments performed only after incidents',
            'No third-party AI vendor due diligence',
        ],
        actions: [
            'Appoint an AI Risk Owner or Committee',
            'Begin inventorying all AI/ML systems in use',
            'Draft a preliminary AI Acceptable Use Policy',
        ],
    },
    {
        level: 2,
        name: 'Defined',
        color: '#3B82F6',
        bg: '#EFF6FF',
        description: 'Standardised definitions and baseline controls are documented. Governance exists but is not consistently applied.',
        characteristics: [
            'Formal AI governance policy documented',
            'Basic model register maintained',
            'Risk taxonomy defined and communicated',
            'Initial bias and fairness checks performed',
        ],
        actions: [
            'Implement a standardised model risk assessment template',
            'Establish a mandatory AI procurement checklist',
            'Train all AI project leads on governance policy',
        ],
    },
    {
        level: 3,
        name: 'Managed',
        color: '#8B5CF6',
        bg: '#FAF5FF',
        description: 'Quantitative metrics are tracked and governance controls are continuously monitored across the AI lifecycle.',
        characteristics: [
            'KRIs and KPIs tracked for all material AI systems',
            'Continuous model drift and bias monitoring active',
            'Third-party AI audit completed annually',
            'Incident response playbook tested and operational',
        ],
        actions: [
            'Integrate AI risk metrics into ERM dashboard',
            'Conduct annual red-team exercise on critical AI systems',
            'Deploy automated model monitoring tooling',
        ],
    },
    {
        level: 4,
        name: 'Optimized',
        color: '#003366',
        bg: '#EFF6FF',
        description: 'Adaptive governance with real-time feedback loops. AI risk management is embedded across the entire organisation.',
        characteristics: [
            'Real-time AI risk dashboard available to board',
            'Fully automated model validation pipeline',
            'AI governance integrated with enterprise ESG reporting',
            'Continuous regulatory horizon scanning in place',
        ],
        actions: [
            'Publish annual AI Transparency Report',
            'Contribute to industry standards and working groups',
            'Evolve governance to address agentic and generative AI',
        ],
    },
];

const IMPLEMENTATION_GUIDE = [
    {
        phase: 'Phase 1',
        title: 'Governance Foundation',
        duration: '0–3 months',
        icon: '🏛️',
        steps: [
            { step: '1.1', title: 'Establish an AI Risk Committee', desc: 'Form a cross-functional committee including Legal, Compliance, IT, and Business unit heads. Define charter, cadence, and escalation paths.' },
            { step: '1.2', title: 'Appoint an AI Risk Owner', desc: 'Designate a senior individual (CISO, Chief Risk Officer, or equivalent) as accountable owner for the AI Risk Framework.' },
            { step: '1.3', title: 'Draft the AI Acceptable Use Policy', desc: 'Document approved AI use cases, prohibited applications, data handling requirements, and employee obligations.' },
            { step: '1.4', title: 'Build the AI System Inventory', desc: 'Catalogue all AI/ML systems in production, development, and evaluation. Include vendor-provided and embedded AI features.' },
        ],
    },
    {
        phase: 'Phase 2',
        title: 'Risk Assessment',
        duration: '3–6 months',
        icon: '🔍',
        steps: [
            { step: '2.1', title: 'Apply the AI Risk Classification Matrix', desc: 'Classify each system by impact (high/medium/low) and risk domain (bias, security, operational, reputational). Align to EU AI Act risk tiers where applicable.' },
            { step: '2.2', title: 'Conduct Model Risk Assessments', desc: 'For each material AI system, complete a structured MRA covering model purpose, training data quality, validation approach, and residual risk.' },
            { step: '2.3', title: 'Perform Vendor AI Due Diligence', desc: 'Assess third-party AI tools against the ARC Vendor Assessment Template covering transparency, security, bias controls, and contractual safeguards.' },
            { step: '2.4', title: 'Map Regulatory Obligations', desc: 'Identify applicable AI regulations (EU AI Act, NIST AI RMF, ISO 42001, sector-specific rules) and map them to internal controls.' },
        ],
    },
    {
        phase: 'Phase 3',
        title: 'Controls & Monitoring',
        duration: '6–12 months',
        icon: '🛡️',
        steps: [
            { step: '3.1', title: 'Implement Technical Controls', desc: 'Deploy model explainability tools, drift detection, differential privacy where required, and adversarial robustness testing.' },
            { step: '3.2', title: 'Establish Continuous Monitoring', desc: 'Define KRIs, KPIs, and alert thresholds for all high-risk AI systems. Integrate with existing SIEM and risk dashboards.' },
            { step: '3.3', title: 'Build an AI Incident Response Plan', desc: 'Define roles, escalation paths, communication protocols, and remediation playbooks for AI-specific incidents including bias events and model failures.' },
        ],
    },
    {
        phase: 'Phase 4',
        title: 'Audit & Optimisation',
        duration: 'Ongoing',
        icon: '📊',
        steps: [
            { step: '4.1', title: 'Conduct Annual AI Governance Audit', desc: 'Assess adherence to the framework, control effectiveness, and regulatory changes. Produce a formal audit report for the Board.' },
            { step: '4.2', title: 'Publish an AI Transparency Report', desc: 'Disclose material AI use cases, governance posture, and risk mitigations to stakeholders. Align to emerging disclosure standards.' },
            { step: '4.3', title: 'Iterate the Framework', desc: 'Update the framework annually to reflect new AI capabilities (agents, multimodal models), regulatory developments, and lessons learned.' },
        ],
    },
];

const AUDIT_TEMPLATES = [
    {
        id: 'T-01',
        title: 'AI System Intake & Classification Form',
        category: 'Governance',
        format: 'Excel / PDF',
        description: 'Used at the point of procuring or deploying any new AI system. Captures system purpose, owner, data inputs, intended user base, and initial risk classification.',
        fields: ['System Name & Owner', 'Business Use Case', 'Data Sources & Sensitivity', 'Regulatory Applicability', 'Initial Risk Tier (High / Medium / Low)', 'Approval Signatures'],
    },
    {
        id: 'T-02',
        title: 'Model Risk Assessment (MRA) Template',
        category: 'Risk Assessment',
        format: 'Word / Notion',
        description: 'A structured 6-section assessment covering model purpose, design, validation, deployment controls, monitoring, and residual risk — aligned to SR 11-7 and NIST AI RMF.',
        fields: ['Model Purpose & Scope', 'Training Data Lineage', 'Validation Methodology & Results', 'Known Limitations & Risks', 'Monitoring Controls', 'Residual Risk Rating & Sign-off'],
    },
    {
        id: 'T-03',
        title: 'AI Vendor Due Diligence Questionnaire',
        category: 'Third-Party Risk',
        format: 'Excel',
        description: 'A 40-question structured questionnaire for assessing external AI vendors and SaaS providers embedding AI. Covers transparency, data handling, bias controls, security, and contractual protections.',
        fields: ['Company & Product Overview', 'Data Privacy & Processing', 'Model Transparency & Explainability', 'Bias & Fairness Controls', 'Security Certifications (SOC 2, ISO 27001)', 'Contractual AI Obligations'],
    },
    {
        id: 'T-04',
        title: 'EU AI Act Compliance Checklist',
        category: 'Regulatory',
        format: 'PDF / Excel',
        description: 'A clause-mapped checklist for organisations subject to the EU AI Act. Covers high-risk system obligations, GPAI model requirements, and transparency rules with compliance status tracking.',
        fields: ['System Classification', 'Mandatory Documentation Requirements', 'Conformity Assessment Status', 'GPAI Obligations (if applicable)', 'Post-Market Monitoring Plan', 'Regulatory Submission Tracker'],
    },
    {
        id: 'T-05',
        title: 'AI Incident Report Template',
        category: 'Incident Response',
        format: 'Word / Jira',
        description: 'Standardised incident report for logging and investigating AI-related failures including bias events, adversarial attacks, data breaches, and model malfunctions.',
        fields: ['Incident Summary & Timeline', 'Systems & Data Affected', 'Root Cause Analysis', 'Regulatory Notification Required?', 'Remediation Actions & Owner', 'Lessons Learned & Framework Updates'],
    },
    {
        id: 'T-06',
        title: 'Annual AI Governance Audit Report',
        category: 'Audit',
        format: 'Word / PowerPoint',
        description: 'A board-ready annual audit report template assessing the overall health of the AI governance framework, control effectiveness, and compliance status.',
        fields: ['Scope & Methodology', 'AI System Portfolio Review', 'Control Effectiveness Ratings', 'Regulatory Compliance Status', 'Key Findings & Risk Ratings', 'Management Action Plan'],
    },
];

const CATEGORY_COLORS = {
    Governance: '#003366',
    'Risk Assessment': '#7C3AED',
    'Third-Party Risk': '#D97706',
    Regulatory: '#059669',
    'Incident Response': '#DC2626',
    Audit: '#0284C7',
};

// ─── Section renderers ────────────────────────────────────────────────────────

const CorePillarsSection = () => (
    <div>
        <h2 style={{ marginBottom: '0.5rem', color: '#1E293B' }}>Core Pillars of Oversight</h2>
        <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.95rem' }}>
            The six foundational pillars that every enterprise AI governance programme must address.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem' }}>
            {pillars.map((pillar, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.75rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#CBD5E1', lineHeight: '1', minWidth: '52px' }}>
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', color: '#1E293B' }}>{pillar.title}</h3>
                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>{pillar.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MaturityLevelsSection = () => (
    <div>
        <h2 style={{ marginBottom: '0.5rem', color: '#1E293B' }}>AI Governance Maturity Model</h2>
        <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Four progressive maturity levels to assess and improve your organisation's AI risk posture. Identify where you are today and what it takes to advance.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {MATURITY_LEVELS.map((ml) => (
                <div key={ml.level} style={{ background: ml.bg, border: `1.5px solid ${ml.color}25`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: ml.color, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '800', fontSize: '1rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {ml.level}
                        </span>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Level {ml.level}: {ml.name}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                        <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.1rem' }}>{ml.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: ml.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Characteristics</p>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {ml.characteristics.map((c, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '0.83rem', color: '#475569' }}>
                                            <span style={{ color: ml.color, marginTop: '2px', flexShrink: 0 }}>•</span> {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Next Actions</p>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {ml.actions.map((a, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '0.83rem', color: '#475569' }}>
                                            <CheckCircle size={13} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} /> {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ImplementationGuideSection = () => (
    <div>
        <h2 style={{ marginBottom: '0.5rem', color: '#1E293B' }}>Implementation Guide</h2>
        <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            A phased roadmap for embedding AI risk governance across your organisation — from initial policy through to continuous audit and optimisation.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {IMPLEMENTATION_GUIDE.map((phase) => (
                <div key={phase.phase} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#003366', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{phase.icon}</span>
                        <div>
                            <span style={{ color: '#93C5FD', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{phase.phase} · {phase.duration}</span>
                            <h3 style={{ color: 'white', margin: '2px 0 0', fontSize: '1.05rem', fontWeight: '700' }}>{phase.title}</h3>
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {phase.steps.map((s) => (
                            <div key={s.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{ background: '#EFF6FF', color: '#003366', fontSize: '0.7rem', fontWeight: '800', padding: '3px 7px', borderRadius: '4px', flexShrink: 0, marginTop: '2px' }}>{s.step}</span>
                                <div>
                                    <p style={{ fontWeight: '700', color: '#1E293B', margin: '0 0 3px', fontSize: '0.92rem' }}>{s.title}</p>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AuditTemplatesSection = () => (
    <div>
        <h2 style={{ marginBottom: '0.5rem', color: '#1E293B' }}>Audit Templates</h2>
        <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Production-ready templates for AI governance, risk assessment, regulatory compliance, and audit reporting. Full templates are available to Council members.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {AUDIT_TEMPLATES.map((t) => {
                const catColor = CATEGORY_COLORS[t.category] || '#003366';
                return (
                    <div key={t.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '14px', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 9px', flexShrink: 0 }}>
                                <ClipboardList size={18} color={catColor} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '2px 7px', borderRadius: '4px' }}>{t.id}</span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'white', background: catColor, padding: '2px 8px', borderRadius: '4px' }}>{t.category}</span>
                                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginLeft: 'auto' }}>
                                        <FileText size={11} style={{ display: 'inline', marginRight: '3px' }} />{t.format}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{t.title}</h3>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#FAFAFA' }}>
                            <p style={{ fontSize: '0.87rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: '1.6' }}>{t.description}</p>
                            <div>
                                <p style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Fields</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {t.fields.map((f) => (
                                        <span key={f} style={{ background: 'white', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        <div style={{ marginTop: '2rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#1D4ED8" style={{ flexShrink: 0 }} />
            <div>
                <p style={{ fontWeight: '700', color: '#1E3A8A', margin: '0 0 3px', fontSize: '0.9rem' }}>Full templates available to Council Members</p>
                <p style={{ margin: 0, fontSize: '0.83rem', color: '#3B82F6' }}>
                    Join the AI Risk Council to download editable versions of all templates in Excel, Word, and PDF formats.
                </p>
            </div>
        </div>
    </div>
);

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'pillars', label: 'Core Pillars', component: CorePillarsSection },
    { key: 'maturity', label: 'Maturity Levels', component: MaturityLevelsSection },
    { key: 'implementation', label: 'Implementation Guide', component: ImplementationGuideSection },
    { key: 'audit', label: 'Audit Templates', component: AuditTemplatesSection },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const Framework = () => {
    const [activeSection, setActiveSection] = useState('pillars');
    const ActiveComponent = NAV_ITEMS.find(n => n.key === activeSection)?.component || CorePillarsSection;

    return (
        <>
            <Section style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>AI Risk Governance Framework</h1>
                    <p style={{ fontSize: '1.15rem', color: '#475569', fontWeight: '400', lineHeight: '1.6' }}>
                        A structured approach to identifying, measuring, and mitigating artificial intelligence risks across the enterprise lifecycle.
                    </p>
                </div>
            </Section>

            <Section>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }}>
                    {/* Sidebar Nav */}
                    <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Framework Modules
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', padding: 0, margin: 0 }}>
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeSection === item.key;
                                return (
                                    <li
                                        key={item.key}
                                        onClick={() => setActiveSection(item.key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.7rem 1rem',
                                            borderRadius: '8px',
                                            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                            background: isActive ? '#EFF6FF' : 'transparent',
                                            color: isActive ? 'var(--primary)' : '#64748B',
                                            fontWeight: isActive ? '700' : '500',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {item.label}
                                        {isActive && <ChevronRight size={15} color="var(--primary)" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Dynamic content */}
                    <div>
                        <ActiveComponent />
                    </div>
                </div>
            </Section>
        </>
    );
};

export default Framework;
