const router = require('express').Router();
const db = require('../Db');
const { authRequired, adminOnly } = require('../middleware/auth');

// GET /api/users/me/questions
router.get('/me/questions', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT q.*, (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answer_count
             FROM questions q WHERE q.user_id = ? ORDER BY q.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/me/answers
router.get('/me/answers', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, q.title AS question_title FROM answers a
             JOIN questions q ON a.question_id = q.id WHERE a.user_id = ? ORDER BY a.created_at DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users — admin only
router.get('/', authRequired, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, approval_status, is_banned, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/users/:id/role — admin only
// Fixed: include all 3 valid roles: 'user', 'member', 'admin'
router.patch('/:id/role', authRequired, adminOnly, async (req, res) => {
    const { role } = req.body;
    if (!['user', 'member', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be: user, member, or admin' });
    }
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: `Role updated to ${role}` });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/users/:id/approval_status — admin only
router.patch('/:id/approval_status', authRequired, adminOnly, async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid approval status' });
    }
    try {
        await db.query('UPDATE users SET approval_status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: `Approval status updated to ${status}` });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/users/:id/ban — admin only
router.patch('/:id/ban', authRequired, adminOnly, async (req, res) => {
    const { is_banned } = req.body;
    try {
        await db.query('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, req.params.id]);
        res.json({ message: `User ${is_banned ? 'banned' : 'unbanned'}` });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/users/:id — admin only
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;