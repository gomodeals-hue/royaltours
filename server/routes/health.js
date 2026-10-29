const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/health - Server health and database connectivity check
router.get('/', async (req, res) => {
    try {
        const row = await db.getAsync('SELECT 1 as healthy');
        res.json({
            status: 'online',
            service: 'The Royal Tours & Travels API',
            database: row && row.healthy === 1 ? 'connected' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            service: 'The Royal Tours & Travels API',
            database: 'disconnected',
            error: err.message
        });
    }
});

module.exports = router;
