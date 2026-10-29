const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (!req.path.startsWith('/src') && !req.path.endsWith('.mp4')) {
            console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Mount API Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/admin', require('./routes/admin'));

// Serve Static Frontend Files (HTML, JS, CSS, Videos)
const ROOT_DIR = path.resolve(__dirname, '..');
app.use(express.static(ROOT_DIR));

// Fallback route for Admin Dashboard or direct page access
app.get('/admin', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'admin.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server after initializing Database
async function startServer() {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log('====================================================');
            console.log(`🏰 THE ROYAL TOURS & TRAVELS — BACKEND SERVER`);
            console.log(`🌐 Website:        http://localhost:${PORT}`);
            console.log(`🛡️  Admin Portal:   http://localhost:${PORT}/admin.html`);
            console.log(`⚡ API Health:     http://localhost:${PORT}/api/health`);
            console.log('====================================================');
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
