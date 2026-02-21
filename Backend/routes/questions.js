const router = require('express').Router();
const db = require('../Db');
const { authRequired, authOptional, adminOnly } = require('../middleware/auth');

// GET /api/questions — list all questions
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT q.*, u.name AS author_name, u.role AS author_role
            FROM questions q
            JOIN users u ON q.user_id = u.id
            ORDER BY q.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/questions/search?q=term
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query too short' });

    try {
        const term = `%${q}%`;
        const [rows] = await db.query(`
            SELECT q.*, u.name AS author_name, u.role AS author_role
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.title LIKE ? OR q.details LIKE ?
            ORDER BY q.created_at DESC
        `, [term, term]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/questions/:id — single question with answers
router.get('/:id', async (req, res) => {
    try {
        const [qRows] = await db.query(`
            SELECT q.*, u.name AS author_name, u.role AS author_role
            FROM questions q
            JOIN users u ON q.user_id = u.id
            WHERE q.id = ?
        `, [req.params.id]);

        if (qRows.length === 0) return res.status(404).json({ error: 'Question not found' });

        const [answers] = await db.query(`
            SELECT a.*, u.name AS author_name, u.role AS author_role
            FROM answers a
            JOIN users u ON a.user_id = u.id
            WHERE a.question_id = ?
            ORDER BY a.is_official DESC, a.created_at ASC
        `, [req.params.id]);

        res.json({ ...qRows[0], answers });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/questions — create question
// Supports both logged-in users and guests (guest creates ephemeral user by email)
router.post('/', authOptional, async (req, res) => {
    const { title, details, email, name, category } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        let userId = req.user?.id;

        // Guest flow: find or create user by email
        if (!userId) {
            if (!email) return res.status(400).json({ error: 'Email required for guests' });

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                userId = existing[0].id;
            } else {
                const [created] = await db.query(
                    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
                    [email, name || 'Guest', '']
                );
                userId = created.insertId;
            }
        }

        // Resolve category
        let categoryId = null;
        if (category) {
            const [catRows] = await db.query('SELECT id FROM categories WHERE slug = ? OR name = ?', [category, category]);
            if (catRows.length > 0) categoryId = catRows[0].id;
        }

        const [result] = await db.query(
            'INSERT INTO questions (user_id, category_id, title, details) VALUES (?, ?, ?, ?)',
            [userId, categoryId, title, details || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Question posted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/questions/:id — owner or admin can delete
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id FROM questions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Question not found' });

        const isOwner = rows[0].user_id === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

        await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/questions/:id/status — admin can change status
router.patch('/:id/status', authRequired, adminOnly, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['open', 'closed', 'answered'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    try {
        await db.query('UPDATE questions SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;