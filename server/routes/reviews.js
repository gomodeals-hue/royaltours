const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/reviews - Get approved customer reviews (or all for admin)
router.get('/', async (req, res) => {
    try {
        const { all, package_name } = req.query;
        let sql = 'SELECT * FROM reviews WHERE 1=1';
        const params = [];

        if (!all) {
            sql += ' AND is_approved = 1';
        }

        if (package_name) {
            sql += ' AND package_name LIKE ?';
            params.push(`%${package_name}%`);
        }

        sql += ' ORDER BY created_at DESC';
        const reviews = await db.allAsync(sql, params);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
    }
});

// POST /api/reviews - Submit customer review
router.post('/', async (req, res) => {
    try {
        const { customer_name, location, rating = 5, package_name, review_text } = req.body;

        if (!customer_name || !review_text) {
            return res.status(400).json({ success: false, message: 'Name and review content are required.' });
        }

        const ratingNum = Math.min(5, Math.max(1, parseInt(rating) || 5));

        const result = await db.runAsync(`
            INSERT INTO reviews (customer_name, location, rating, package_name, review_text, is_approved)
            VALUES (?, ?, ?, ?, ?, 1)
        `, [
            customer_name.trim(),
            location ? location.trim() : 'Coimbatore',
            ratingNum,
            package_name || 'General Experience',
            review_text.trim()
        ]);

        const created = await db.getAsync('SELECT * FROM reviews WHERE id = ?', [result.lastID]);
        res.status(201).json({
            success: true,
            message: 'Thank you for sharing your royal experience! Your review is now published.',
            data: created
        });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
});

// PATCH /api/reviews/:id/approve - Moderate review
router.patch('/:id/approve', async (req, res) => {
    try {
        const { is_approved } = req.body;
        await db.runAsync('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, req.params.id]);
        res.json({ success: true, message: `Review ${is_approved ? 'approved' : 'hidden'} successfully.` });
    } catch (err) {
        console.error('Error approving review:', err);
        res.status(500).json({ success: false, message: 'Failed to moderate review.' });
    }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', async (req, res) => {
    try {
        await db.runAsync('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Review deleted successfully.' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ success: false, message: 'Failed to delete review.' });
    }
});

module.exports = router;
