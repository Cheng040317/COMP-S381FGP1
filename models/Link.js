const mongoose = require('mongoose');
let schema = require('../schemas/Link');

const Link = mongoose.model('Link', schema);

module.exports = Link;
