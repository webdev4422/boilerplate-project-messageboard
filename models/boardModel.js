const mongoose = require('mongoose')
const { Schema } = mongoose

// Reply Schema - object for storing thread replies as a subdocument of Thread models
const ReplySchema = new Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
})

// Thread Schema - object for storing threads as a document in mongoose database
const ThreadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  bumped_on: { type: Date, default: Date.now, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  replies: [ReplySchema],
})

// Create Thread and Reply models for creating database objects
const Thread = mongoose.model('Thread', ThreadSchema)
const Reply = mongoose.model('Reply', ReplySchema)

module.exports = { Thread, Reply }
