const mongoose = require('mongoose');

// 评论模型
const CommentSchema = new mongoose.Schema({
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }, // 所属博客
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 评论用户
    content: { type: String, required: true }, // 评论内容
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now } 
});

module.exports = CommentSchema;
