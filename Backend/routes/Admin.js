// routes/admin.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../Db');
const { authRequired, adminOnly } = require('../middleware/auth');

// All routes require auth + admin role
router.use(authRequired, adminOnly);

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, is_banned, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/role — change a user's role
router.patch('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    const validRoles = ['user', 'member', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    // Prevent admin from demoting themselves
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(403).json({ error: 'Cannot change your own role' });
    }

    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'Role updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/ban — toggle ban status
router.patch('/users/:id/ban', async (req, res) => {
    const { is_banned } = req.body;

    if (parseInt(req.params.id) === req.user.id) {
        return res.status(403).json({ error: 'Cannot ban yourself' });
    }

    try {
        await db.query('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, req.params.id]);
        res.json({ message: `User ${is_banned ? 'banned' : 'unbanned'} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/admin/users/:id — delete a user
router.delete('/users/:id', async (req, res) => {
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(403).json({ error: 'Cannot delete yourself' });
    }

    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/admin/users — create a new user (admin can set any role)
router.post('/users', async (req, res) => {
    const { name, email, password, role } = req.body;

    const validRoles = ['user', 'member', 'admin'];
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
    if (role && !validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

        const password_hash = await bcrypt.hash(password, 12);
        const assignedRole = role || 'user';
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, assignedRole]
        );
        res.status(201).json({ message: 'User created', user: { id: result.insertId, name, email, role: assignedRole } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;