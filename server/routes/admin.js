const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'royaltours-secret-jwt-key-2026';

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Token required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    }
}

// POST /api/admin/login - Authenticate admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username/email and password required.' });
        }

        const admin = await db.getAsync(
            'SELECT * FROM admins WHERE username = ? OR email = ?',
            [username.trim(), username.trim()]
        );

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const isMatch = bcrypt.compareSync(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
});

// GET /api/admin/me - Verify current session
router.get('/me', verifyAdminToken, (req, res) => {
    res.json({ success: true, admin: req.admin });
});

// GET /api/admin/stats - Overview analytics and dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await db.getAsync('SELECT COUNT(*) as count FROM bookings');
        const pendingBookings = await db.getAsync('SELECT COUNT(*) as count FROM bookings WHERE status = "Pending"');
        const confirmedBookings = await db.getAsync('SELECT COUNT(*) as count FROM bookings WHERE status = "Confirmed"');
        const totalContacts = await db.getAsync('SELECT COUNT(*) as count FROM contacts');
        const newContacts = await db.getAsync('SELECT COUNT(*) as count FROM contacts WHERE status = "New"');
        const totalPackages = await db.getAsync('SELECT COUNT(*) as count FROM packages WHERE is_active = 1');
        const totalSubscribers = await db.getAsync('SELECT COUNT(*) as count FROM newsletter');
        const totalReviews = await db.getAsync('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 1');

        const recentBookings = await db.allAsync('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
        const recentContacts = await db.allAsync('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5');

        res.json({
            success: true,
            stats: {
                totalBookings: totalBookings.count,
                pendingBookings: pendingBookings.count,
                confirmedBookings: confirmedBookings.count,
                totalContacts: totalContacts.count,
                newContacts: newContacts.count,
                totalPackages: totalPackages.count,
                totalSubscribers: totalSubscribers.count,
                totalReviews: totalReviews.count
            },
            recentBookings,
            recentContacts
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
    }
});

// GET /api/admin/export/:type - Export data to CSV
router.get('/export/:type', async (req, res) => {
    try {
        const type = req.params.type;
        let rows = [];
        let filename = 'export.csv';

        if (type === 'bookings') {
            rows = await db.allAsync('SELECT ref_id, customer_name, phone, email, package_name, travel_date, travelers, status, created_at FROM bookings ORDER BY created_at DESC');
            filename = `royal_tours_bookings_${Date.now()}.csv`;
        } else if (type === 'contacts') {
            rows = await db.allAsync('SELECT id, name, phone, email, service_type, destination, status, created_at FROM contacts ORDER BY created_at DESC');
            filename = `royal_tours_enquiries_${Date.now()}.csv`;
        } else if (type === 'newsletter') {
            rows = await db.allAsync('SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC');
            filename = `royal_tours_subscribers_${Date.now()}.csv`;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid export type.' });
        }

        if (rows.length === 0) {
            return res.send('No records found');
        }

        const headers = Object.keys(rows[0]).join(',');
        const csvContent = rows.map(r =>
            Object.values(r).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(`${headers}\n${csvContent}`);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).send('Error generating export');
    }
});

module.exports = router;
