const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /api/newsletter - Subscribe email
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Valid email address is required.' });
        }

        const existing = await db.getAsync('SELECT * FROM newsletter WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing) {
            return res.json({ success: true, message: 'You are already subscribed to Royal Tours exclusive updates!' });
        }

        await db.runAsync('INSERT INTO newsletter (email) VALUES (?)', [email.trim().toLowerCase()]);
        res.status(201).json({
            success: true,
            message: '🎉 Welcome to The Royal Expedition Club! You will receive early bird package deals & travel guides.'
        });
    } catch (err) {
        console.error('Error subscribing to newsletter:', err);
        res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again.' });
    }
});

// GET /api/newsletter - List subscribers (Admin)
router.get('/', async (req, res) => {
    try {
        const subscribers = await db.allAsync('SELECT * FROM newsletter ORDER BY created_at DESC');
        res.json({ success: true, count: subscribers.length, data: subscribers });
    } catch (err) {
        console.error('Error fetching subscribers:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve subscribers.' });
    }
});

// DELETE /api/newsletter/:id - Delete subscriber
router.delete('/:id', async (req, res) => {
    try {
        await db.runAsync('DELETE FROM newsletter WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Subscriber removed.' });
    } catch (err) {
        console.error('Error deleting subscriber:', err);
        res.status(500).json({ success: false, message: 'Failed to remove subscriber.' });
    }
});

module.exports = router;
