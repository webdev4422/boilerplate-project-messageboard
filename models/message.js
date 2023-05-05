const mongoose = require('mongoose')

// Create schema
const messageSchema = new mongoose.Schema({
  // test: mongoose.SchemaTypes.ObjectId,
  text: String,
  password: { type: String, required: true },
})

// Create model wrapper on schema
const Message = mongoose.model('Message', messageSchema)

module.exports = Message
