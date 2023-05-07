const Board = require('../models/boardModel.js')
const Thread = require('../models/threadModel.js')
const { createThread, viewThread } = require('../controllers/threadController.js')

// post: /api/threads/:board board=boardX; text=test; delete_password=aaaa
const createBoard = async (req, res) => {
  // Create thread
  const thread = await Thread.create({
    text: req.body.text,
    password: req.body.delete_password,
    created_on: Date.now(),
    bumped_on: Date.now(),
    replies: [],
    replycount: 0,
  })

  // Check if board exist
  const boardX = await Board.find({ name: req.body.board }) // return array
  if (boardX.length > 0) {
    boardX[0].threads.push(thread) // push thread onto board
    // Redirect to get /b/:board
    res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
    return
  }
  // Create board and push thread
  const board = await Board.create({
    name: req.body.board,
    threads: [thread],
  })
  // Redirect to get /b/:board
  res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
}

// get: /api/threads/:board
// Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const viewBoard = async (req, res) => {
  const board = await Board.find({ name: req.body.board })
  res.json(board)
}
module.exports = { createBoard, viewBoard }
