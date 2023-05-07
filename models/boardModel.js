const mongoose = require('mongoose')

// Create schema
const boardSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, dropDups: true },
  threads: Array,
})

// Create model wrapper on schema
module.exports = mongoose.model('Board', boardSchema)
