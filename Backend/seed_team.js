const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const https = require('https');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const uploadsDir = path.resolve(__dirname, 'uploads');

const teamMembers = [
    // Leadership (10)
    { name: 'Dr. Sarah Chen', role: 'Head of AI Research', category: 'leadership', description: 'Dr. Chen leads our core research initiatives focusing on neural network safety and interpretability.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/14.jpg' },
    { name: 'Marcus Johnson', role: 'Chief Risk Officer', category: 'leadership', description: 'Marcus brings 15 years of standard risk management and applies it to modern AI systems governance.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Elena Rodriguez', role: 'Ethics Lead', category: 'leadership', description: 'Elena focuses on algorithmic bias, fairness, and the ethical deployment of autonomous systems.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'David Kim', role: 'Senior Security Engineer', category: 'leadership', description: 'Specializes in red-teaming LLMs and identifying vulnerabilities in production ML pipelines.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { name: 'Priya Sharma', role: 'Director of Policy', category: 'leadership', description: 'Priya bridges the gap between technical AI capabilities and emerging global regulatory frameworks.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/59.jpg' },
    { name: 'Alex Thompson', role: 'Lead Auditor', category: 'leadership', description: 'Alex develops our proprietary frameworks for conducting comprehensive AI system audits.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { name: 'Dr. James Wilson', role: 'Principal Data Scientist', category: 'leadership', description: 'Focuses on privacy-preserving machine learning techniques including federated learning.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/82.jpg' },
    { name: 'Maria Garcia', role: 'Compliance Manager', category: 'leadership', description: 'Ensures our internal and external operations adhere to the highest international data standards.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { name: 'Tom Baker', role: 'Systems Architect', category: 'leadership', description: 'Designs scalable, secure infrastructure for deploying large-scale AI models reliably.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/62.jpg' },
    { name: 'Nina Patel', role: 'Community Outreach', category: 'leadership', description: 'Engages with external stakeholders, organizing our workshops, seminars, and public forums.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/11.jpg' },

    // Industrial AI Experts (5)
    { name: 'Dr. Robert Chang', role: 'Industrial Automation Specialist', category: 'industrial', description: 'Robert focuses on the integration of computer vision in smart manufacturing facilities.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/15.jpg' },
    { name: 'Samantha Lee', role: 'Supply Chain AI Modeler', category: 'industrial', description: 'Samantha builds predictive models to anticipate supply chain disruptions on a global scale.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/24.jpg' },
    { name: 'Prof. Hans Mueller', role: 'Robotics Integration Lead', category: 'industrial', description: 'Hans ensures safety protocols are strictly followed in human-robot collaborative environments.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/44.jpg' },
    { name: 'Jessica Taylor', role: 'IoT Edge Computing', category: 'industrial', description: 'Jessica optimizes machine learning models to run efficiently on low-power industrial edge devices.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/42.jpg' },
    { name: 'Oliver Green', role: 'Predictive Maintenance Lead', category: 'industrial', description: 'Oliver develops acoustic and vibration analysis tools to predict heavy machinery failures.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/51.jpg' },

    // Security Team (5)
    { name: 'Amira Hassan', role: 'Head of Penetration Testing', category: 'security', description: 'Amira specializes in highly complex cyber-physical attacks against emerging AI models.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/71.jpg' },
    { name: 'Daniel Foster', role: 'Cloud Security Architect', category: 'security', description: 'Daniel hardens our cloud training pipelines against external intrusion and internal leakage.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/88.jpg' },
    { name: 'Chloe Davies', role: 'Cryptography Expert', category: 'security', description: 'Chloe is pioneering the use of homomorphic encryption for training models on sensitive health data.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/8.jpg' },
    { name: 'Kevin O\'Connor', role: 'Threat Intelligence Lead', category: 'security', description: 'Kevin monitors deep web channels to track emerging adversarial tactics weaponized against AI.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/men/38.jpg' },
    { name: 'Rachel Zane', role: 'Incident Response Commander', category: 'security', description: 'Rachel orchestrates the council’s rapid response protocol during active security breaches.', linkedin: 'https://linkedin.com/', img: 'https://randomuser.me/api/portraits/women/92.jpg' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function seed() {
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('Connected to DB. Clearing old team...');

    // Create table if not exists with correct schema just in case
    await db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        linkedin_url TEXT,
        category TEXT DEFAULT 'leadership' CHECK(category IN ('leadership', 'industrial', 'security')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
  `);

    await db.exec('DELETE FROM team_members');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    for (let i = 0; i < teamMembers.length; i++) {
        const t = teamMembers[i];
        const fileName = `team-seed-v2-${i + 1}.jpg`;
        const localPath = path.join(uploadsDir, fileName);

        console.log(`Downloading image for ${t.name}...`);
        try {
            await downloadImage(t.img, localPath);
            const dbPathStr = `/uploads/${fileName}`;
            await db.run(
                'INSERT INTO team_members (name, role, description, linkedin_url, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
                [t.name, t.role, t.description, t.linkedin, dbPathStr, t.category]
            );
        } catch (err) {
            console.error(`Failed to download for ${t.name}:`, err);
        }
    }
    console.log(`Seeded ${teamMembers.length} team members with pictures and categories.`);

    console.log('Done.');
    process.exit(0);
}

seed();
