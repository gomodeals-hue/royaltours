const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Helper to generate unique booking reference
function generateRefId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RT-2026-${randomNum}`;
}

// POST /api/bookings - Create new tour booking inquiry
router.post('/', async (req, res) => {
    try {
        const { customer_name, phone, email, package_name, travel_date, travelers, notes } = req.body;

        if (!customer_name || !phone || !package_name) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone number, and package selection are required.'
            });
        }

        const ref_id = generateRefId();

        const result = await db.runAsync(`
            INSERT INTO bookings (ref_id, customer_name, phone, email, package_name, travel_date, travelers, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `, [
            ref_id,
            customer_name.trim(),
            phone.trim(),
            email ? email.trim() : '',
            package_name.trim(),
            travel_date || '',
            travelers || '2 Adults',
            notes ? notes.trim() : ''
        ]);

        // Generate WhatsApp link for instant contact
        const agencyPhone = '919842212345';
        const msgText = encodeURIComponent(
            `Hello The Royal Tours! I have submitted a booking inquiry (Ref: ${ref_id}) for *${package_name}*. Name: ${customer_name}, Date: ${travel_date || 'Flexible'}, Travelers: ${travelers || '2 Adults'}. Please provide the quotation.`
        );
        const whatsapp_link = `https://wa.me/${agencyPhone}?text=${msgText}`;

        const createdBooking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [result.lastID]);

        console.log(`[Booking] New inquiry from ${customer_name} for ${package_name} [${ref_id}]`);

        res.status(201).json({
            success: true,
            message: 'Your booking enquiry has been received successfully! Our Coimbatore travel expert will contact you within 2 hours.',
            ref_id,
            whatsapp_link,
            booking: createdBooking
        });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while processing booking. Please try again or call us directly.'
        });
    }
});

// GET /api/bookings - List all bookings (for Admin Dashboard)
router.get('/', async (req, res) => {
    try {
        const { status, search, limit = 100 } = req.query;
        let sql = 'SELECT * FROM bookings WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (customer_name LIKE ? OR phone LIKE ? OR ref_id LIKE ? OR package_name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const bookings = await db.allAsync(sql, params);
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
    }
});

// GET /api/bookings/:id - Single booking
router.get('/:id', async (req, res) => {
    try {
        const booking = await db.getAsync('SELECT * FROM bookings WHERE id = ? OR ref_id = ?', [req.params.id, req.params.id]);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.json({ success: true, data: booking });
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve booking.' });
    }
});

// PATCH /api/bookings/:id - Update booking status / notes
router.patch('/:id', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const booking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [req.params.id]);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const newStatus = status || booking.status;
        const newNotes = notes !== undefined ? notes : booking.notes;

        await db.runAsync(`
            UPDATE bookings
            SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [newStatus, newNotes, req.params.id]);

        const updated = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: `Booking #${booking.ref_id} status updated to ${newStatus}`,
            data: updated
        });
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ success: false, message: 'Failed to update booking.' });
    }
});

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({ success: false, message: 'Failed to delete booking.' });
    }
});

module.exports = router;
