// searchRoutes.js
// Search and Filter Routes for Gift API - Full Stack Capstone Project

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./db');

// =========================================
// GET /api/search - Search and filter gifts
// Query parameters:
//   - category: Filter by category
//   - minPrice: Minimum price
//   - maxPrice: Maximum price
//   - q: Search term (searches in title and description)
//   - sortBy: Sort by field (price, title, createdAt)
//   - sortOrder: asc or desc
// =========================================
router.get('/', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Build the filter query based on query parameters
        const filterQuery = {};
        
        // =========================================
        // CATEGORY FILTER - Main requirement
        // =========================================
        if (req.query.category) {
            filterQuery.category = req.query.category;
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filterQuery.price = {};
            
            if (req.query.minPrice) {
                filterQuery.price.$gte = parseFloat(req.query.minPrice);
            }
            
            if (req.query.maxPrice) {
                filterQuery.price.$lte = parseFloat(req.query.maxPrice);
            }
        }
        
        // Text search in title and description
        if (req.query.q) {
            const searchTerm = req.query.q;
            filterQuery.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        // Build sort options
        let sortOptions = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sortOptions[sortField] = sortOrder;
        } else {
            sortOptions = { createdAt: -1 }; // Default: newest first
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Execute the query
        const gifts = await giftsCollection
            .find(filterQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .toArray();
        
        // Get total count for pagination
        const totalCount = await giftsCollection.countDocuments(filterQuery);
        
        // Get unique categories for frontend filters
        const categories = await giftsCollection.distinct('category');
        
        res.status(200).json({
            success: true,
            count: gifts.length,
            total: totalCount,
            page: page,
            pages: Math.ceil(totalCount / limit),
            filters: {
                category: req.query.category || null,
                minPrice: req.query.minPrice || null,
                maxPrice: req.query.maxPrice || null,
                searchTerm: req.query.q || null
            },
            availableCategories: categories,
            data: gifts
        });
    } catch (error) {
        console.error('Error searching gifts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching gifts',
            error: error.message
        });
    }
});

// =========================================
// GET /api/search/categories - Get all unique categories
// =========================================
router.get('/categories', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        // Get unique categories
        const categories = await giftsCollection.distinct('category');
        
        // Count gifts in each category
        const categoryStats = await giftsCollection.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).toArray();
        
        res.status(200).json({
            success: true,
            categories: categories,
            stats: categoryStats
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories',
            error: error.message
        });
    }
});

// =========================================
// GET /api/search/category/:categoryName - Get gifts by specific category
// =========================================
router.get('/category/:categoryName', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        const categoryName = req.params.categoryName;
        
        // Filter by category (case-insensitive)
        const gifts = await giftsCollection
            .find({ 
                category: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
            })
            .sort({ createdAt: -1 })
            .toArray();
        
        res.status(200).json({
            success: true,
            category: categoryName,
            count: gifts.length,
            data: gifts
        });
    } catch (error) {
        console.error('Error fetching gifts by category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching gifts by category',
            error: error.message
        });
    }
});

// =========================================
// GET /api/search/price-range - Get gifts within price range
// =========================================
router.get('/price-range', async (req, res) => {
    try {
        // Connect to the database using connectToDatabase() method
        const db = await connectToDatabase();
        
        const giftsCollection = db.collection('gifts');
        
        const minPrice = parseFloat(req.query.min) || 0;
        const maxPrice = parseFloat(req.query.max) || 10000;
        
        // Filter by price range
        const gifts = await giftsCollection
            .find({
                price: {
                    $gte: minPrice,
                    $lte: maxPrice
                }
            })
            .sort({ price: 1 })
            .toArray();
        
        res.status(200).json({
            success: true,
            priceRange: { min: minPrice, max: maxPrice },
            count: gifts.length,
            data: gifts
        });
    } catch (error) {
        console.error('Error fetching gifts by price range:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching gifts by price range',
            error: error.message
        });
    }
});

// Export the router
module.exports = router;