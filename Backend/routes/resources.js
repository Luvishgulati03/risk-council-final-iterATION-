const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../Db');
const { authRequired, authOptional, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF, DOCX, XLSX allowed'));
    }
});

// Helper: does this user have member-or-above access?
// Roles: 'user' (public only), 'member' (all), 'admin' (all + manage)
const hasMemberAccess = (user) => user && (user.role === 'member' || user.role === 'admin');

// GET /api/resources
router.get('/', authOptional, async (req, res) => {
    try {
        let query = 'SELECT * FROM resources WHERE 1=1';
        const params = [];

        if (req.query.type) { query += ' AND type = ?'; params.push(req.query.type); }

        query += ' ORDER BY created_at DESC';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/resources/:id
router.get('/:id', authOptional, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const resource = rows[0];
        // Block 'user' role and unauthenticated from member resources
        if (resource.access === 'Members Only' && !hasMemberAccess(req.user)) {
            return res.status(403).json({ error: 'Member access required' });
        }
        res.json(resource);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/resources/:id/download — increment download count
router.post('/:id/download', authOptional, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, access FROM resources WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (rows[0].access === 'Members Only' && !hasMemberAccess(req.user)) {
            return res.status(403).json({ error: 'Member access required' });
        }
        await db.query('UPDATE resources SET download_count = COALESCE(download_count, 0) + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/resources — admin only
router.post('/', authRequired, adminOnly, upload.single('file'), async (req, res) => {
    const { title, summary, description, source_url, external_link, type, access_level, access, category_slug } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const desc = summary || description || null;
        const link = source_url || external_link || null;
        const acc = access_level || access || 'Public';

        // Let's resolve category ID if slug is provided
        let catId = null;
        if (category_slug) {
            const [cats] = await db.query('SELECT id FROM categories WHERE name = ?', [category_slug]);
            if (cats.length > 0) catId = cats[0].id;
        }

        const [result] = await db.query(
            `INSERT INTO resources (title, description, external_link, file_path, type, access, category_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, desc, link, file_path, type || 'Guide', acc, catId]
        );
        const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/resources/:id — admin only
router.put('/:id', authRequired, adminOnly, upload.single('file'), async (req, res) => {
    const { title, summary, description, source_url, external_link, type, access_level, access, category_slug } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    try {
        const desc = summary || description || null;
        const link = source_url || external_link || null;
        const acc = access_level || access || 'Public';

        // Resolve Category String to ID
        let catId = null;
        if (category_slug) {
            const [cats] = await db.query('SELECT id FROM categories WHERE name = ?', [category_slug]);
            if (cats.length > 0) catId = cats[0].id;
        }

        if (req.file) {
            const file_path = `/uploads/${req.file.filename}`;
            await db.query(
                `UPDATE resources SET title=?, description=?, external_link=?, file_path=?, type=?, access=?, category_id=? WHERE id=?`,
                [title, desc, link, file_path, type || 'Guide', acc, catId, req.params.id]
            );
        } else {
            await db.query(
                `UPDATE resources SET title=?, description=?, external_link=?, type=?, access=?, category_id=? WHERE id=?`,
                [title, desc, link, type || 'Guide', acc, catId, req.params.id]
            );
        }

        const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/resources/:id — admin only
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT file_path FROM resources WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (rows[0].file_path) {
            const fp = path.join(__dirname, '..', rows[0].file_path);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
        await db.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;