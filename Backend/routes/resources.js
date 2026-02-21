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
        let query = 'SELECT * FROM articles WHERE 1=1';
        const params = [];

        // Only member+ can see registered resources
        if (!hasMemberAccess(req.user)) {
            query += " AND access_level = 'public'";
        }

        if (req.query.category) { query += ' AND category_slug = ?'; params.push(req.query.category); }
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
        const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const resource = rows[0];
        // Block 'user' role and unauthenticated from member resources
        if (resource.access_level === 'registered' && !hasMemberAccess(req.user)) {
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
        const [rows] = await db.query('SELECT id, access_level FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (rows[0].access_level === 'registered' && !hasMemberAccess(req.user)) {
            return res.status(403).json({ error: 'Member access required' });
        }
        await db.query('UPDATE articles SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/resources — admin only
router.post('/', authRequired, adminOnly, upload.single('file'), async (req, res) => {
    const { title, summary, source_url, category_slug, type, access_level } = req.body;
    if (!title || !summary) return res.status(400).json({ error: 'Title and summary required' });
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const [result] = await db.query(
            `INSERT INTO articles (title, summary, source_url, file_path, category_slug, type, access_level)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, summary, source_url || null, file_path, category_slug || null, type || 'article', access_level || 'public']
        );
        const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/resources/:id — admin only
router.put('/:id', authRequired, adminOnly, upload.single('file'), async (req, res) => {
    const { title, summary, source_url, category_slug, type, access_level } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Not found' });
        const file_path = req.file ? `/uploads/${req.file.filename}` : existing[0].file_path;
        await db.query(
            `UPDATE articles SET title=?, summary=?, source_url=?, file_path=?, category_slug=?, type=?, access_level=? WHERE id=?`,
            [
                title || existing[0].title,
                summary || existing[0].summary,
                source_url || existing[0].source_url,
                file_path,
                category_slug || existing[0].category_slug,
                type || existing[0].type,
                access_level || existing[0].access_level,
                req.params.id
            ]
        );
        const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/resources/:id — admin only
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT file_path FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (rows[0].file_path) {
            const fp = path.join(__dirname, '..', rows[0].file_path);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
        await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;