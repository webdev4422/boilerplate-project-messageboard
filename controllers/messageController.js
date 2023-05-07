const Message = require('../models/message.js')

// post: /api/threads/:board board=boardX; text=test; delete_password=aaaa
const postMessage = async (req, res) => {
  const message = await Message.create({
    text: req.body.text,
    password: req.body.delete_password,
    created_on: Date.now(),
    bumped_on: Date.now(),
    replies: [],
    replycount: 0,
  })
  // Redirect to get /b/:board
  res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
}

// get: /api/threads/:board
// Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const getMessages = async (req, res) => {
  const message = await Message.find({})
  res.json(message)
}
module.exports = { postMessage, getMessages }
// app.route('/api/threads/general').post((app) => {
// const messagesCollection = await Message.find()
// console.log(messagesCollection)
// })
// Drop DB for test purpose
// await Message.collection.drop()
