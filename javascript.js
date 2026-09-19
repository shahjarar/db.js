// server.js
// Main Server File for Full Stack Capstone Project

const express = require('express');
const cors = require('cors');
const giftRoutes = require('./giftRoutes');
const { disconnectFromDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gifts', giftRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Full Stack Capstone Project API is running',
        endpoints: {
            gifts: '/api/gifts',
            giftById: '/api/gifts/:id'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API endpoint: http://localhost:${PORT}/api/gifts`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});