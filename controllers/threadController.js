const Thread = require('../models/threadModel.js')

// post: /api/threads/:board board=boardX; text=test; delete_password=aaaa
const createThread = async (req, res) => {
  const message = await Thread.create({
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
const viewThread = async (req, res) => {
  const message = await Thread.find({})
  res.json(message)
}
module.exports = { createThread, viewThread }
// app.route('/api/threads/general').post((app) => {
// const messagesCollection = await Thread.find()
// console.log(messagesCollection)
// })
// Drop DB for test purpose
// await Thread.collection.drop()
