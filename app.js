// app.js
// Main Application File - Full Stack Capstone Project

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route modules
const giftRoutes = require('./giftRoutes');
const searchRoutes = require('./searchRoutes');

// Import database connection
const { connectToDatabase, disconnectFromDatabase } = require('./db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// =========================================
// API ROUTES
// =========================================

// Gift routes
app.use('/api/gifts', giftRoutes);

// Search routes - serves /api/search with category filtering
app.use('/api/search', searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Full Stack Capstone Project API',
        endpoints: {
            gifts: '/api/gifts',
            search: '/api/search',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const db = await connectToDatabase();
        res.status(200).json({
            success: true,
            status: 'healthy',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Search API: http://localhost:${PORT}/api/search`);
    
    try {
        await connectToDatabase();
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});

module.exports = app;