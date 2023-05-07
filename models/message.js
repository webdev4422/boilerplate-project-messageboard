const mongoose = require('mongoose')

// Create schema
const messageSchema = new mongoose.Schema({
  text: String,
  password: { type: String, required: true },
  created_on: Date,
  bumped_on: Date,
  replies: Array,
  replycount: Number,
})

// Create model wrapper on schema
module.exports = mongoose.model('Message', messageSchema)
