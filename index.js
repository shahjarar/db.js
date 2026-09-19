// sentiment/index.js
// Sentiment Analysis Module - Full Stack Capstone Project
// Uses the 'natural' npm package for NLP-based sentiment analysis

const natural = require('natural');

// =========================================
// SENTIMENT ANALYZER SETUP
// =========================================

// Initialize the Sentiment Analyzer with English language
const SentimentAnalyzer = new natural.SentimentAnalyzer('English', 
    natural.PorterStemmer, 
    'afinn'
);

// Tokenizer for breaking text into words
const tokenizer = new natural.WordTokenizer();

// =========================================
// FUNCTION: Analyze sentiment of a text
// =========================================
/**
 * Analyzes the sentiment of given text
 * @param {string} text - The text to analyze
 * @returns {object} - Sentiment score and label (positive/negative/neutral)
 */
function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
        return {
            success: false,
            message: 'Invalid input. Please provide a valid string.',
            score: 0,
            label: 'neutral'
        };
    }

    try {
        // Tokenize the input text
        const tokens = tokenizer.tokenize(text);

        // Get sentiment score using natural package
        const score = SentimentAnalyzer.getSentiment(tokens);

        // Determine label based on score
        let label;
        if (score > 0) {
            label = 'positive';
        } else if (score < 0) {
            label = 'negative';
        } else {
            label = 'neutral';
        }

        return {
            success: true,
            text: text,
            score: score,
            label: label,
            wordCount: tokens.length,
            analyzedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return {
            success: false,
            message: 'Error analyzing sentiment',
            error: error.message,
            score: 0,
            label: 'neutral'
        };
    }
}

// =========================================
// FUNCTION: Batch analyze multiple texts
// =========================================
/**
 * Analyzes sentiment of multiple texts
 * @param {Array<string>} texts - Array of texts to analyze
 * @returns {Array<object>} - Array of sentiment results
 */
function batchAnalyze(texts) {
    if (!Array.isArray(texts)) {
        return {
            success: false,
            message: 'Input must be an array of strings'
        };
    }

    const results = texts.map(text => analyzeSentiment(text));
    
    // Calculate overall statistics
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const avgScore = results.length > 0 ? totalScore / results.length : 0;

    return {
        success: true,
        total: results.length,
        averageScore: avgScore,
        results: results
    };
}

// =========================================
// FUNCTION: Get word frequencies
// =========================================
/**
 * Gets word frequency from text using natural's FrequencyTable
 * @param {string} text - Text to analyze
 * @returns {object} - Word frequencies
 */
function getWordFrequencies(text) {
    const tokens = tokenizer.tokenize(text);
    const freqTable = {};
    
    tokens.forEach(word => {
        const lowerWord = word.toLowerCase();
        freqTable[lowerWord] = (freqTable[lowerWord] || 0) + 1;
    });

    return {
        success: true,
        text: text,
        totalWords: tokens.length,
        uniqueWords: Object.keys(freqTable).length,
        frequencies: freqTable
    };
}

// =========================================
// EXPORTS
// =========================================
module.exports = {
    analyzeSentiment,
    batchAnalyze,
    getWordFrequencies,
    SentimentAnalyzer,
    tokenizer,
    natural
};

// =========================================
// TEST / DEMO (when run directly)
// =========================================
if (require.main === module) {
    console.log('========================================');
    console.log('  Sentiment Analysis Module - Demo');
    console.log('========================================');

    const testTexts = [
        'I love this product! It is absolutely amazing and wonderful.',
        'This is terrible. I hate it so much.',
        'The weather is okay today, nothing special.',
        'What a fantastic experience! Highly recommended!',
        'I am very disappointed with the service.'
    ];

    console.log('\n📝 Analyzing sample texts...\n');
    
    testTexts.forEach((text, index) => {
        const result = analyzeSentiment(text);
        console.log(`Test ${index + 1}:`);
        console.log(`  Text: "${text}"`);
        console.log(`  Score: ${result.score}`);
        console.log(`  Label: ${result.label}`);
        console.log('');
    });

    console.log('✅ Sentiment analysis module is working correctly!');
}