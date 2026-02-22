const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function seed() {
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    await db.run('DELETE FROM resources WHERE type="news"');

    const articles = [
        ['Q1 Regulatory Update: EU AI Act', 'The European Union has finalized the sweeping AI Act. Understand the compliance requirements for deploying high-risk foundational models across member states.', 'news', 'public'],
        ['Council Expansion Announcement', 'We are thrilled to expand the Risk Council size to include 500 new diverse members globally, providing representation across 40 different countries.', 'news', 'public'],
        ['New Threat Vector Identified', 'Our research team has published a new brief detailing prompt injection vulnerabilities in popular customer service LLMs. We advise immediate patching.', 'news', 'public'],
        ['Annual AI Security Report 2026', 'Download the summary of our annual findings on enterprise AI adoption risk. The report highlights severe gaps in data provenance tracking.', 'news', 'public'],
        ['Partnership with GovTech Lab', 'AI Risk Council is partnering with the National GovTech Lab to develop standardized red-teaming benchmarks for public sector algorithms.', 'news', 'public'],
        ['Open Source Auditing Framework v2', 'We just released version 2 of our open-source AI auditing framework. It now includes comprehensive tools for evaluating dataset bias and representation.', 'news', 'public'],
        ['Upcoming Executive Webinar', 'Join our upcoming webinar on navigating the complex landscape of global AI regulations. Featuring guest speakers from top regulatory bodies.', 'news', 'public']
    ];

    for (const article of articles) {
        await db.run('INSERT INTO resources (title, description, type, access) VALUES (?, ?, ?, ?)', article);
    }

    console.log('7 News items seeded');
    process.exit(0);
}
seed();
