const mongoose = require('mongoose');

// Blog model
const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isTop: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, // Creation time
    updatedAt: {
        type: Date,
        default: Date.now
    } // Update time
});

module.exports = BlogSchema;