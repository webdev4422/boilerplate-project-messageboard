const mongoose = require('mongoose')

// Create reply schema
const replySchema = new mongoose.Schema({
  text: String,
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  reported: { type: Boolean, default: false },
})
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
const Thread = mongoose.model('Thread', threadSchema)

// Create board schema
const boardSchema = new mongoose.Schema({
  board: { type: String, required: true, unique: true, dropDups: true },
  threads: [threadSchema],
})
const Board = mongoose.model('Board', boardSchema)

// mongoose.model(boardSchema)
// Create model wrapper on schema
module.exports = { Board, Thread, Reply }
