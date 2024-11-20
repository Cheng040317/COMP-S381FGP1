const mongoose = require('mongoose');
let schema = require('../schemas/Category');

const Category = mongoose.model('Category', schema);
module.exports = Category;