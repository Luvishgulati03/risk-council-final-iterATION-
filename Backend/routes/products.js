const router = require('express').Router();
const db = require('../Db');
const { authRequired, authOptional, adminOnly } = require('../middleware/auth');

// Roles allowed to submit reviews
const REVIEWER_ROLES = ['member', 'executive', 'company', 'admin'];

// GET /api/products — list all products with average rating
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*,
                   COALESCE(AVG(pr.stars), 0) AS avg_rating,
                   COUNT(pr.id) AS review_count
            FROM products p
            LEFT JOIN product_reviews pr ON pr.product_id = p.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
        // Round avg_rating to 1 decimal
        const products = rows.map(r => ({ ...r, avg_rating: Math.round((r.avg_rating || 0) * 10) / 10 }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching products' });
    }
});

// GET /api/products/:id — single product with all reviews
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!products || (Array.isArray(products) && products.length === 0)) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const product = Array.isArray(products) ? products[0] : products;

        const [reviews] = await db.query(`
            SELECT pr.*, u.name AS reviewer_name, u.role AS reviewer_role
            FROM product_reviews pr
            JOIN users u ON u.id = pr.user_id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `, [req.params.id]);

        // Get average
        const [avgResult] = await db.query(
            'SELECT COALESCE(AVG(stars), 0) AS avg_rating, COUNT(*) AS review_count FROM product_reviews WHERE product_id = ?',
            [req.params.id]
        );
        const avg = Array.isArray(avgResult) ? avgResult[0] : avgResult;

        res.json({
            ...product,
            avg_rating: Math.round((avg.avg_rating || 0) * 10) / 10,
            review_count: avg.review_count || 0,
            reviews: reviews || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching product' });
    }
});

// GET /api/products/:id/reviews — all reviews for a product
router.get('/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT pr.*, u.name AS reviewer_name, u.role AS reviewer_role
            FROM product_reviews pr
            JOIN users u ON u.id = pr.user_id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `, [req.params.id]);
        res.json(reviews || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching reviews' });
    }
});

// POST /api/products — admin create product
router.post('/', authRequired, adminOnly, async (req, res) => {
    const { name, company, description, download_link } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, company, description, download_link) VALUES (?, ?, ?, ?)',
            [name, company || '', description || '', download_link || '']
        );
        res.status(201).json({ id: result.insertId, name, company, description, download_link });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating product' });
    }
});

// DELETE /api/products/:id — admin delete
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting product' });
    }
});

// POST /api/products/:id/reviews — submit a review (paid members, execs, companies only)
router.post('/:id/reviews', authRequired, async (req, res) => {
    if (!REVIEWER_ROLES.includes(req.user.role)) {
        return res.status(403).json({ error: 'Only paid members, executives, and product companies can submit reviews' });
    }

    const { stars, review_text } = req.body;
    if (!stars || stars < 1 || stars > 5) {
        return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    try {
        // Check if product exists
        const [products] = await db.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
        const product = Array.isArray(products) ? products[0] : products;
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Check if user already reviewed this product
        const [existing] = await db.query(
            'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        const hasReview = Array.isArray(existing) ? existing.length > 0 : !!existing;
        if (hasReview) {
            // Update existing review
            await db.query(
                'UPDATE product_reviews SET stars = ?, review_text = ? WHERE product_id = ? AND user_id = ?',
                [stars, review_text || '', req.params.id, req.user.id]
            );
            return res.json({ message: 'Review updated' });
        }

        const [result] = await db.query(
            'INSERT INTO product_reviews (product_id, user_id, stars, review_text) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, stars, review_text || '']
        );
        res.status(201).json({ id: result.insertId, message: 'Review submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error submitting review' });
    }
});

module.exports = router;
