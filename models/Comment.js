const mongoose = require('mongoose');
let schema = require('../schemas/Comment');

const Comment = mongoose.model('Comment', schema);

module.exports = Comment;
