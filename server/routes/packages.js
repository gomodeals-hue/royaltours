const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Helper to safely parse JSON gallery images
function formatPackage(pkg) {
    if (!pkg) return null;
    let gallery = [];
    if (pkg.gallery_images) {
        try {
            gallery = JSON.parse(pkg.gallery_images);
        } catch (e) {
            gallery = [];
        }
    }
    return {
        ...pkg,
        gallery_images: gallery
    };
}

// GET /api/packages - Get packages catalog with filtering & search
router.get('/', async (req, res) => {
    try {
        const { category, search, featured, sort } = req.query;
        let sql = 'SELECT * FROM packages WHERE is_active = 1';
        const params = [];

        if (category && category.toLowerCase() !== 'all') {
            sql += ' AND LOWER(category) = LOWER(?)';
            params.push(category);
        }

        if (featured !== undefined) {
            sql += ' AND is_featured = ?';
            params.push(parseInt(featured));
        }

        if (search) {
            sql += ' AND (title LIKE ? OR destination LIKE ? OR highlights LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        if (sort === 'price_asc') {
            sql += ' ORDER BY price_numeric ASC';
        } else if (sort === 'price_desc') {
            sql += ' ORDER BY price_numeric DESC';
        } else {
            sql += ' ORDER BY is_featured DESC, id ASC';
        }

        const packages = await db.allAsync(sql, params);
        const formatted = packages.map(formatPackage);

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (err) {
        console.error('Error fetching packages:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve tour packages.' });
    }
});

// GET /api/packages/:slug - Single package details by slug or id
router.get('/:slug', async (req, res) => {
    try {
        const param = req.params.slug;
        const pkg = await db.getAsync(
            'SELECT * FROM packages WHERE slug = ? OR id = ?',
            [param, isNaN(param) ? -1 : parseInt(param)]
        );

        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found.' });
        }

        res.json({
            success: true,
            data: formatPackage(pkg)
        });
    } catch (err) {
        console.error('Error fetching package:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve package.' });
    }
});

// POST /api/packages - Admin add package
router.post('/', async (req, res) => {
    try {
        const {
            slug, title, destination, category, duration,
            price, price_numeric, image_url, gallery_images,
            description, highlights, page_url, is_featured = 0
        } = req.body;

        if (!title || !destination || !category || !price) {
            return res.status(400).json({ success: false, message: 'Title, destination, category, and price are required.' });
        }

        const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const galleryJson = typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images || []);

        const result = await db.runAsync(`
            INSERT INTO packages (slug, title, destination, category, duration, price, price_numeric, image_url, gallery_images, description, highlights, page_url, is_featured, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            generatedSlug, title, destination, category, duration || '3 Days',
            price, parseInt(price_numeric) || 0, image_url, galleryJson,
            description, highlights, page_url || 'packages.html', is_featured ? 1 : 0
        ]);

        const created = await db.getAsync('SELECT * FROM packages WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, message: 'Package added successfully!', data: formatPackage(created) });
    } catch (err) {
        console.error('Error creating package:', err);
        res.status(500).json({ success: false, message: 'Failed to create package. Check if slug is unique.' });
    }
});

// PUT /api/packages/:id - Admin edit package
router.put('/:id', async (req, res) => {
    try {
        const {
            title, destination, category, duration, price, price_numeric,
            image_url, gallery_images, description, highlights, page_url, is_featured, is_active
        } = req.body;

        const pkg = await db.getAsync('SELECT * FROM packages WHERE id = ?', [req.params.id]);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found.' });
        }

        const galleryJson = gallery_images !== undefined
            ? (typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images))
            : pkg.gallery_images;

        await db.runAsync(`
            UPDATE packages
            SET title = ?, destination = ?, category = ?, duration = ?, price = ?, price_numeric = ?,
                image_url = ?, gallery_images = ?, description = ?, highlights = ?, page_url = ?,
                is_featured = ?, is_active = ?
            WHERE id = ?
        `, [
            title !== undefined ? title : pkg.title,
            destination !== undefined ? destination : pkg.destination,
            category !== undefined ? category : pkg.category,
            duration !== undefined ? duration : pkg.duration,
            price !== undefined ? price : pkg.price,
            price_numeric !== undefined ? parseInt(price_numeric) : pkg.price_numeric,
            image_url !== undefined ? image_url : pkg.image_url,
            galleryJson,
            description !== undefined ? description : pkg.description,
            highlights !== undefined ? highlights : pkg.highlights,
            page_url !== undefined ? page_url : pkg.page_url,
            is_featured !== undefined ? (is_featured ? 1 : 0) : pkg.is_featured,
            is_active !== undefined ? (is_active ? 1 : 0) : pkg.is_active,
            req.params.id
        ]);

        const updated = await db.getAsync('SELECT * FROM packages WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Package updated successfully!', data: formatPackage(updated) });
    } catch (err) {
        console.error('Error updating package:', err);
        res.status(500).json({ success: false, message: 'Failed to update package.' });
    }
});

// DELETE /api/packages/:id - Admin delete package
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM packages WHERE id = ?', [req.params.id]);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Package not found.' });
        }
        res.json({ success: true, message: 'Package removed successfully.' });
    } catch (err) {
        console.error('Error deleting package:', err);
        res.status(500).json({ success: false, message: 'Failed to delete package.' });
    }
});

module.exports = router;
