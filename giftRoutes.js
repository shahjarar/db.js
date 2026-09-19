// giftRoutes.js
// Express Routes for Gift API - Full Stack Capstone Project

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./db');

// =========================================
// GET /api/gifts - Fetch all gifts
// =========================================
router.get('/', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        // Get the gifts collection
        const giftsCollection = db.collection('gifts');
        
        // Fetch all gifts
        const gifts = await giftsCollection.find({}).toArray();
        
        res.status(200).json({
            success: true,
            count: gifts.length,
            data: gifts
        });
    } catch (error) {
        console.error('Error fetching gifts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching gifts',
            error: error.message
        });
    }
});

// =========================================
// GET /api/gifts/:id - Fetch a single gift by ID
// =========================================
router.get('/:id', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Validate the ID format
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gift ID format'
            });
        }
        
        // Find the gift by ID
        const gift = await giftsCollection.findOne({ _id: new ObjectId(req.params.id) });
        
        if (!gift) {
            return res.status(404).json({
                success: false,
                message: 'Gift not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: gift
        });
    } catch (error) {
        console.error('Error fetching gift:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching gift',
            error: error.message
        });
    }
});

// =========================================
// POST /api/gifts - Create a new gift
// =========================================
router.post('/', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Validate required fields
        const { title, description, price, category } = req.body;
        
        if (!title || !description || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and price'
            });
        }
        
        // Create new gift object
        const newGift = {
            title,
            description,
            price: parseFloat(price),
            category: category || 'General',
            createdAt: new Date()
        };
        
        // Insert into database
        const result = await giftsCollection.insertOne(newGift);
        
        res.status(201).json({
            success: true,
            message: 'Gift created successfully',
            data: { _id: result.insertedId, ...newGift }
        });
    } catch (error) {
        console.error('Error creating gift:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating gift',
            error: error.message
        });
    }
});

// =========================================
// PUT /api/gifts/:id - Update an existing gift
// =========================================
router.put('/:id', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Validate the ID format
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gift ID format'
            });
        }
        
        // Update the gift
        const updateData = { ...req.body, updatedAt: new Date() };
        const result = await giftsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gift not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Gift updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating gift:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating gift',
            error: error.message
        });
    }
});

// =========================================
// DELETE /api/gifts/:id - Delete a gift
// =========================================
router.delete('/:id', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Validate the ID format
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gift ID format'
            });
        }
        
        // Delete the gift
        const result = await giftsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gift not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Gift deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting gift:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting gift',
            error: error.message
        });
    }
});

// Export the router
module.exports = router;