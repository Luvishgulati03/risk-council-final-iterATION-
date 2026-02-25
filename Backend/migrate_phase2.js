/**
 * Phase 2 Migration:
 * 1. playbooks table
 * 2. users profile columns (bio, social links, profile_image)
 * 3. events columns (teams_link, recording_url)
 */
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

async function migrate() {
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('Phase 2 migration — connected to database.');

    // 1. Playbooks table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS playbooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            brief TEXT,
            framework TEXT NOT NULL,
            category TEXT DEFAULT 'Guide',
            file_path TEXT NOT NULL,
            file_name TEXT,
            file_type TEXT,
            download_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ playbooks table created.');

    // 2. Users profile columns (safe ADD COLUMN — ignore if already exists)
    const userCols = [
        "ALTER TABLE users ADD COLUMN bio TEXT",
        "ALTER TABLE users ADD COLUMN linkedin_url TEXT",
        "ALTER TABLE users ADD COLUMN twitter_url TEXT",
        "ALTER TABLE users ADD COLUMN website_url TEXT",
        "ALTER TABLE users ADD COLUMN profile_image TEXT"
    ];
    for (const sql of userCols) {
        try { await db.exec(sql); } catch (e) { /* column already exists */ }
    }
    console.log('✅ users profile columns added.');

    // 3. Events columns
    const eventCols = [
        "ALTER TABLE events ADD COLUMN teams_link TEXT",
        "ALTER TABLE events ADD COLUMN recording_url TEXT"
    ];
    for (const sql of eventCols) {
        try { await db.exec(sql); } catch (e) { /* column already exists */ }
    }
    console.log('✅ events teams_link, recording_url columns added.');

    // 4. Seed sample playbooks
    const count = await db.get('SELECT COUNT(*) as c FROM playbooks');
    if (count.c === 0) {
        const playbooks = [
            { title: 'EU AI Act Compliance Checklist', brief: 'A step-by-step checklist for organizations to assess and achieve compliance with the EU AI Act, covering risk classification, documentation requirements, and conformity assessment procedures.', framework: 'EU AI Act', category: 'Checklist', file_type: 'pdf' },
            { title: 'NIST AI RMF Implementation Guide', brief: 'Comprehensive guide to implementing the NIST AI Risk Management Framework, with practical templates for the Govern, Map, Measure, and Manage functions.', framework: 'NIST AI RMF', category: 'Guide', file_type: 'pdf' },
            { title: 'ISO 42001 Gap Assessment Template', brief: 'Spreadsheet-based gap assessment tool for evaluating organizational readiness against ISO/IEC 42001 AI Management System requirements.', framework: 'ISO 42001', category: 'Template', file_type: 'xlsx' },
            { title: 'AI Model Risk Policy Template', brief: 'Ready-to-use internal policy template for AI model risk management, aligned with SR 11-7 and EU AI Act requirements for high-risk systems.', framework: 'EU AI Act', category: 'Policy', file_type: 'docx' },
            { title: 'AI Incident Response Playbook', brief: 'Step-by-step incident response procedures for AI system failures, bias events, and adversarial attacks. Includes notification templates and escalation matrices.', framework: 'NIST AI RMF', category: 'Guide', file_type: 'pdf' },
            { title: 'Board AI Governance Report Template', brief: 'Quarterly board reporting template for AI governance metrics, risk appetite tracking, and compliance status across the AI portfolio.', framework: 'ISO 42001', category: 'Template', file_type: 'xlsx' },
        ];
        for (const pb of playbooks) {
            await db.run(
                'INSERT INTO playbooks (title, brief, framework, category, file_path, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [pb.title, pb.brief, pb.framework, pb.category, `/uploads/playbooks/sample_${pb.category.toLowerCase()}.${pb.file_type}`, `${pb.title}.${pb.file_type}`, pb.file_type]
            );
        }
        console.log('✅ Seeded 6 sample playbooks.');
    }

    console.log('Phase 2 migration complete.');
    await db.close();
}

migrate().catch(err => { console.error('Migration error:', err); process.exit(1); });
