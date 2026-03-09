/**
 * User Model
 * Stores user authentication data and references to brand DNA
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption helpers for sensitive fields (API keys)
const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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
    // Ayrshare API key (encrypted at rest)
    ayrshareApiKey: {
        type: String,
        default: null,
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

/**
 * Set the Ayrshare API key (encrypts before saving)
 */
userSchema.methods.setAyrshareKey = function(plainKey) {
    this.ayrshareApiKey = plainKey ? encrypt(plainKey) : null;
};

/**
 * Get the decrypted Ayrshare API key
 */
userSchema.methods.getAyrshareKey = function() {
    if (!this.ayrshareApiKey) return null;
    try {
        return decrypt(this.ayrshareApiKey);
    } catch {
        return null;
    }
};

/**
 * Check if user has an Ayrshare API key configured
 */
userSchema.methods.hasAyrshareKey = function() {
    return !!this.ayrshareApiKey;
};

module.exports = mongoose.model('User', userSchema);
