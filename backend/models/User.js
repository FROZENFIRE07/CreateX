/**
 * User Model
 * Stores user authentication data and references to brand DNA
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // Reference to user's brand DNA for content orchestration
    brandDNA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BrandDNA'
    },
    // KPI tracking
    stats: {
        totalContent: { type: Number, default: 0 },
        totalRepurposed: { type: Number, default: 0 },
        avgConsistencyScore: { type: Number, default: 0 },
        timesSaved: { type: Number, default: 0 } // in minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
