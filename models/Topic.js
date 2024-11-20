const mongoose = require('mongoose');

let schema = require('../schemas/Topic');

const Topic = mongoose.model('Topic', schema);

module.exports = Topic;