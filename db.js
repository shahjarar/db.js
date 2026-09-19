// db.js
// MongoDB Connection File for Full Stack Capstone Project

const { MongoClient } = require('mongodb');

// MongoDB connection URI (local or Atlas)
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

// Database name
const dbName = 'fullstack_capstone';

// Create a new MongoClient
const client = new MongoClient(uri);

// Function to connect to MongoDB
async function connectToDatabase() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('✅ Successfully connected to MongoDB');
        
        // Specify the database to be used
        const database = client.db(dbName);
        
        return database;
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        throw error;
    }
}

// Function to disconnect from MongoDB
async function disconnectFromDatabase() {
    try {
        await client.close();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
}

// Export the functions and client
module.exports = {
    connectToDatabase,
    disconnectFromDatabase,
    client,
    dbName
};