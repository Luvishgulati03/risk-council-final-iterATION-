const router = require('express').Router();
const db = require('../Db');
const { authRequired, authOptional, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dir exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'playbooks');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.pptx'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET /api/playbooks — public, list all playbooks
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, title, brief, framework, category, file_type, file_name, download_count, created_at FROM playbooks ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/playbooks/:id/download — authenticated users only
router.get('/:id/download', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM playbooks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Playbook not found' });

        const pb = rows[0];
        await db.query('UPDATE playbooks SET download_count = download_count + 1 WHERE id = ?', [pb.id]);

        const filePath = path.join(__dirname, '..', pb.file_path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(filePath, pb.file_name || path.basename(pb.file_path));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/playbooks — admin only, upload playbook with file
router.post('/', authRequired, adminOnly, upload.single('file'), async (req, res) => {
    const { title, brief, framework, category } = req.body;
    if (!title || !framework || !req.file) {
        return res.status(400).json({ error: 'Title, framework, and file are required' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const filePath = `/uploads/playbooks/${req.file.filename}`;

    try {
        const [result] = await db.query(
            'INSERT INTO playbooks (title, brief, framework, category, file_path, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, brief || '', framework, category || 'Guide', filePath, req.file.originalname, ext]
        );
        res.status(201).json({ id: result.insertId, title, framework, category, file_type: ext });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/playbooks/:id — admin only
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT file_path FROM playbooks WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            const filePath = path.join(__dirname, '..', rows[0].file_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await db.query('DELETE FROM playbooks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Playbook deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
