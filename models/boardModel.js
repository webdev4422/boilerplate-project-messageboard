const mongoose = require('mongoose')

// Create reply schema
const replySchema = new mongoose.Schema({
  text: String,
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  reported: { type: Boolean, default: false },
})
// Create model wrapper on schema
const Reply = mongoose.model('Reply', replySchema)

// Create thread schema
const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  bumped_on: { type: Date, default: Date.now, required: true },
  reported: { type: Boolean, default: false },
  replies: [replySchema],
  replycount: Number,
})
// Create model wrapper on schema
const Thread = mongoose.model('Thread', threadSchema)

// Create board schema
const boardSchema = new mongoose.Schema({
  board: { type: String, required: true, unique: true, dropDups: true },
  threads: [threadSchema],
})
// Create model wrapper on schema
const Board = mongoose.model('Board', boardSchema)

// Export models
module.exports = { Board, Thread, Reply }
