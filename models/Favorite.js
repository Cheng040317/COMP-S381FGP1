const mongoose = require('mongoose');
let schema = require('../schemas/Favorite');

const Favorite = mongoose.model('Favorite', schema);
module.exports = Favorite;