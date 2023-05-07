const mongoose = require('mongoose')

// Create schema
const boardSchema = new mongoose.Schema({
  name: String,
  threads: Array,
})

// Create model wrapper on schema
module.exports = mongoose.model('Board', boardSchema)
