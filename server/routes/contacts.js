const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /api/contacts - Submit contact form or service enquiry
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, service_type, destination, message } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone number are required.'
            });
        }

        const result = await db.runAsync(`
            INSERT INTO contacts (name, phone, email, service_type, destination, message, status)
            VALUES (?, ?, ?, ?, ?, ?, 'New')
        `, [
            name.trim(),
            phone.trim(),
            email ? email.trim() : '',
            service_type || 'General Holiday Enquiry',
            destination ? destination.trim() : '',
            message ? message.trim() : ''
        ]);

        const agencyPhone = '919842212345';
        const msgText = encodeURIComponent(
            `Hello The Royal Tours! I sent an enquiry for *${service_type || 'Travel Services'}*. Name: ${name}, Phone: ${phone}. Destination: ${destination || 'Not specified'}.`
        );
        const whatsapp_link = `https://wa.me/${agencyPhone}?text=${msgText}`;

        const created = await db.getAsync('SELECT * FROM contacts WHERE id = ?', [result.lastID]);

        console.log(`[Contact] New inquiry from ${name} (${phone}) for ${service_type || 'General'}`);

        res.status(201).json({
            success: true,
            message: 'Thank you! Your enquiry has been received. Our Coimbatore travel executive will contact you shortly.',
            whatsapp_link,
            data: created
        });
    } catch (err) {
        console.error('Error creating contact inquiry:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting enquiry. Please try again or call us directly.'
        });
    }
});

// GET /api/contacts - List all inquiries
router.get('/', async (req, res) => {
    try {
        const { status, search, limit = 100 } = req.query;
        let sql = 'SELECT * FROM contacts WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR service_type LIKE ? OR destination LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const contacts = await db.allAsync(sql, params);
        res.json({ success: true, count: contacts.length, data: contacts });
    } catch (err) {
        console.error('Error fetching contacts:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve enquiries.' });
    }
});

// PATCH /api/contacts/:id - Update contact status / notes
router.patch('/:id', async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const contact = await db.getAsync('SELECT * FROM contacts WHERE id = ?', [req.params.id]);

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Enquiry not found.' });
        }

        const newStatus = status || contact.status;
        const newNotes = admin_notes !== undefined ? admin_notes : contact.admin_notes;

        await db.runAsync(`
            UPDATE contacts
            SET status = ?, admin_notes = ?
            WHERE id = ?
        `, [newStatus, newNotes, req.params.id]);

        const updated = await db.getAsync('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Enquiry updated successfully.', data: updated });
    } catch (err) {
        console.error('Error updating contact:', err);
        res.status(500).json({ success: false, message: 'Failed to update enquiry.' });
    }
});

// DELETE /api/contacts/:id - Delete contact record
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM contacts WHERE id = ?', [req.params.id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Enquiry not found.' });
        }
        res.json({ success: true, message: 'Enquiry deleted successfully.' });
    } catch (err) {
        console.error('Error deleting contact:', err);
        res.status(500).json({ success: false, message: 'Failed to delete enquiry.' });
    }
});

module.exports = router;
