const router = require('express').Router();
const db = require('../Db');
const { authRequired, adminOnly } = require('../middleware/auth');

// GET /api/events
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching events' });
    }
});

// POST /api/events (Admin Only)
router.post('/', authRequired, adminOnly, async (req, res) => {
    const { title, date, location, link, type, category, is_featured, teams_link, recording_url } = req.body;
    if (!title || !date || !location) return res.status(400).json({ error: 'Title, date, and location are required' });

    try {
        const [result] = await db.query(
            'INSERT INTO events (title, date, location, link, type, category, is_featured, teams_link, recording_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, date, location, link || '', type || 'upcoming', category || 'webinar', is_featured ? 1 : 0, teams_link || null, recording_url || null]
        );
        res.status(201).json({ id: result.insertId, title, date, location, link, type, category, is_featured: is_featured ? 1 : 0, teams_link, recording_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating event' });
    }
});

// PUT /api/events/:id (Admin Only)
router.put('/:id', authRequired, adminOnly, async (req, res) => {
    const { title, date, location, link, type, category, is_featured, teams_link, recording_url } = req.body;
    try {
        await db.query(
            'UPDATE events SET title=?, date=?, location=?, link=?, type=?, category=?, is_featured=?, teams_link=?, recording_url=? WHERE id=?',
            [title, date, location, link, type, category || 'webinar', is_featured ? 1 : 0, teams_link || null, recording_url || null, req.params.id]
        );
        res.json({ message: 'Event updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating event' });
    }
});

// DELETE /api/events/:id (Admin Only)
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM events WHERE id=?', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting event' });
    }
});

module.exports = router;
