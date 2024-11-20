const mongoose = require('mongoose');
let schema = require('../schemas/Blog');

const Blog = mongoose.model('Blog', schema);

module.exports = Blog;
