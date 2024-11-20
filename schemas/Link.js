const mongoose = require('mongoose');

// 友情链接
const LinkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    url: {
        type: String,
        required: true
    }, 
    order: {
        type: Number,
        default: 0
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    updatedAt: {
        type: Date,
        default: Date.now
    } 
});

module.exports = LinkSchema;
