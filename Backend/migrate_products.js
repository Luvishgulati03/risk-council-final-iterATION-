/**
 * Migration: Add products + product_reviews tables, seed 8 security products with reviews
 */
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

async function run() {
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('Connected to SQLite database.');

    // 1. Create products table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            company TEXT,
            description TEXT,
            download_link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ products table ready.');

    // 2. Create product_reviews table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS product_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
            review_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ product_reviews table ready.');

    // 3. Clear old seeded data
    await db.run('DELETE FROM product_reviews');
    await db.run('DELETE FROM products');

    // 4. Seed products — real enterprise security tools
    const products = [
        {
            name: 'Microsoft Purview',
            company: 'Microsoft',
            description: 'A unified data governance platform that helps organizations manage and govern their on-premises, multi-cloud, and SaaS data. Provides data discovery, classification, lineage tracking, and compliance management across your entire data estate. Essential for AI data governance, ensuring training data meets regulatory requirements like GDPR and CCPA.',
            download_link: 'https://www.microsoft.com/en-us/security/business/microsoft-purview'
        },
        {
            name: 'Microsoft Defender for Endpoint',
            company: 'Microsoft',
            description: 'An enterprise endpoint security platform designed to help networks prevent, detect, investigate, and respond to advanced threats. Uses behavioral sensors, cloud security analytics, and threat intelligence to provide real-time protection. Critical for securing AI/ML workstations and inference endpoints against sophisticated attacks.',
            download_link: 'https://www.microsoft.com/en-us/security/business/endpoint-security/microsoft-defender-endpoint'
        },
        {
            name: 'Microsoft Sentinel',
            company: 'Microsoft',
            description: 'A cloud-native SIEM (Security Information and Event Management) and SOAR (Security Orchestration, Automation, and Response) solution. Provides intelligent security analytics across the enterprise, using AI-driven threat detection and automated response playbooks. Ideal for monitoring AI pipeline security events at scale.',
            download_link: 'https://azure.microsoft.com/en-us/products/microsoft-sentinel'
        },
        {
            name: 'CrowdStrike Falcon',
            company: 'CrowdStrike',
            description: 'A cloud-native endpoint protection platform combining next-gen antivirus, endpoint detection and response (EDR), threat intelligence, and managed threat hunting. Uses AI-powered indicators of attack (IOAs) to stop breaches in real-time. Industry leader in protecting AI training infrastructure and model serving environments.',
            download_link: 'https://www.crowdstrike.com/platform/'
        },
        {
            name: 'Palo Alto Prisma Cloud',
            company: 'Palo Alto Networks',
            description: 'A comprehensive cloud-native application protection platform (CNAPP) securing hosts, containers, serverless functions, and cloud infrastructure. Provides vulnerability management, compliance monitoring, runtime protection, and network security across multi-cloud environments where AI workloads are deployed.',
            download_link: 'https://www.paloaltonetworks.com/prisma/cloud'
        },
        {
            name: 'Splunk Enterprise Security',
            company: 'Cisco / Splunk',
            description: 'A premium SIEM solution providing security analytics, threat detection, and incident response capabilities. Ingests machine data from virtually any source to surface real-time insights. Widely used for monitoring AI model behavior, detecting anomalous inference patterns, and maintaining audit trails for regulatory compliance.',
            download_link: 'https://www.splunk.com/en_us/products/enterprise-security.html'
        },
        {
            name: 'IBM Guardium',
            company: 'IBM',
            description: 'A comprehensive data security and compliance platform providing data activity monitoring, automated compliance workflows, vulnerability assessment, and data encryption. Protects sensitive AI training data across databases, data warehouses, and cloud environments. Essential for organizations handling PII in AI systems.',
            download_link: 'https://www.ibm.com/products/guardium'
        },
        {
            name: 'Qualys VMDR',
            company: 'Qualys',
            description: 'Vulnerability Management, Detection, and Response (VMDR) is a cloud-based solution that provides global visibility into IT assets, automated vulnerability detection, threat prioritization using real-time threat intelligence, and integrated patch management. Critical for maintaining secure AI deployment infrastructure.',
            download_link: 'https://www.qualys.com/apps/vulnerability-management-detection-response/'
        }
    ];

    for (const p of products) {
        await db.run(
            'INSERT INTO products (name, company, description, download_link) VALUES (?, ?, ?, ?)',
            [p.name, p.company, p.description, p.download_link]
        );
    }
    console.log(`✅ Seeded ${products.length} products.`);

    // 5. Seed reviews from existing users (IDs 1-6 from init_sqlite.js)
    // user 1 = Admin, 3 = Jane (member/approved), 4 = Exec, 5 = Uni, 6 = Company
    const reviewerUsers = [
        { id: 3, name: 'Jane Smith' },
        { id: 4, name: 'Exec Officer' },
        { id: 6, name: 'Tech Corp' },
        { id: 1, name: 'Admin' }
    ];

    const reviewTexts = [
        'Outstanding tool for enterprise AI governance. The automated policy enforcement saves us weeks of manual compliance work.',
        'Solid product with excellent integration capabilities. Documentation could be more detailed for advanced use cases.',
        'Best-in-class threat detection. We deployed it across all our ML training clusters and saw immediate improvements in our security posture.',
        'Good value for the price. The dashboard provides excellent visibility into our AI infrastructure security.',
        'Essential for any organization handling sensitive training data. The compliance reporting alone justifies the investment.',
        'Impressive AI-driven analytics. Caught several anomalies in our model serving pipeline that we would have missed otherwise.',
        'Comprehensive coverage with minimal false positives. The managed hunting service is particularly valuable.',
        'Reliable and scalable. We use it across 3 cloud providers and it provides consistent protection everywhere.'
    ];

    // Get product IDs
    const allProducts = await db.all('SELECT id FROM products ORDER BY id');
    let reviewIdx = 0;
    for (let i = 0; i < allProducts.length; i++) {
        const pid = allProducts[i].id;
        // Each product gets 2-3 reviews
        const numReviews = (i % 2 === 0) ? 3 : 2;
        for (let j = 0; j < numReviews; j++) {
            const reviewer = reviewerUsers[j % reviewerUsers.length];
            const stars = 3 + Math.floor(Math.random() * 3); // 3-5 stars
            const text = reviewTexts[reviewIdx % reviewTexts.length];
            await db.run(
                'INSERT INTO product_reviews (product_id, user_id, stars, review_text) VALUES (?, ?, ?, ?)',
                [pid, reviewer.id, stars, text]
            );
            reviewIdx++;
        }
    }
    console.log(`✅ Seeded ${reviewIdx} product reviews.`);

    await db.close();
    console.log('\n🎉 Product migration and seeding complete!');
    process.exit(0);
}

run();
