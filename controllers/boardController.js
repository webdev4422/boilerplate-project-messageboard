const Board = require('../models/boardModel.js')
const Thread = require('../models/threadModel.js')

// post: /api/threads/:board board=boardX; text=test; delete_password=aaaa
const createBoard = async (req, res) => {
  const objExist = await Board.find({ name: req.body.board })
  if (objExist == 'empty') {
    console.log(await Board.find({ name: req.body.board }))
    console.log(objExist)
    res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
    return
  }
  const thread = await Thread.create({
    text: req.body.text,
    password: req.body.delete_password,
    created_on: Date.now(),
    bumped_on: Date.now(),
    replies: [],
    replycount: 0,
  })
  const board = await Board.create({
    name: req.body.board,
    threads: [thread],
  })
  console.log(board)
  res.json(board)
  // Redirect to get /b/:board
  res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
}

// get: /api/threads/:board
// Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const viewBoard = async (req, res) => {
  const board = await Board.find({})
  res.json(board)
}
module.exports = { createBoard, viewBoard }
