const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'carbonnex_super_secret_key_2025';

// Require valid JWT — returns 401 if missing/invalid
const authRequired = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Optional JWT — attaches user if token present, continues either way
const authOptional = (req, res, next) => {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch {
            req.user = null;
        }
    }
    next();
};

// Must be admin role — use AFTER authRequired
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { JWT_SECRET, authRequired, authOptional, adminOnly };