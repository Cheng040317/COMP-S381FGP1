const mongoose = require('mongoose');
let schema = require('../schemas/User');

const User = mongoose.model('User', schema);

module.exports = User; 