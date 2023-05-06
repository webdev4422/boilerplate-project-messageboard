const mongoose = require('mongoose')

// Create schema
const messageSchema = new mongoose.Schema({
  // test: mongoose.SchemaTypes.ObjectId,
  text: String,
  password: { type: String, required: true },
  created_on: Date,
  bumped_on: Date,
  replies: Array,
  replycount: Number,
})

// Create model wrapper on schema
const Message = mongoose.model('Message', messageSchema)

module.exports = Message
