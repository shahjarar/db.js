// authRoutes.js
// Authentication Routes - Full Stack Capstone Project
// Contains code that calls findOne() to locate current user in database

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');

// JWT Secret Key (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// =========================================
// POST /api/auth/register - Register a new user
// =========================================
router.post('/register', async (req, res) => {
    try {
        // Connect to database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists using findOne
        const existingUser = await usersCollection.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert user into database
        const result = await usersCollection.insertOne(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertedId, email: email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: result.insertedId,
                name: name,
                email: email,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// =========================================
// POST /api/auth/login - Login existing user
// Uses findOne() to locate the current user
// =========================================
router.post('/login', async (req, res) => {
    try {
        // Connect to database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // =========================================
        // CRITICAL: Use findOne() to locate the current user
        // This is the key requirement for Task 11
        // =========================================
        const currentUser = await usersCollection.findOne({ email: email });

        // If user not found in database
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare provided password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, currentUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token for authenticated user
        const token = jwt.sign(
            { 
                userId: currentUser._id, 
                email: currentUser.email, 
                name: currentUser.name,
                role: currentUser.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send success response with token and user info
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
       