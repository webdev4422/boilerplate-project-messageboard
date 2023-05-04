// 'use strict'
const mongoose = require('mongoose')

// Create schema
const messageSchema = new mongoose.Schema({
  text: String,
  password: String,
})
// Create model wrapper on schema
const Message = mongoose.model('Message', messageSchema)

// Create model
const messageX = new Message({
  text: 'test text',
  password: 'aaaa',
})
messageX
  .save()
  .then((obj) => {
    console.log(obj)
  })
  .catch((err) => {
    console.error(err)
  })

module.exports = messageX
