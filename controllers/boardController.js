const Board = require('../models/boardModel.js')

// post: /api/threads/:board board=boardX; text=test; delete_password=aaaa
const createBoard = async (req, res) => {
  const board = await Board.create({
    name: req.body.board,
    threads: [],
  })
  console.log('ok')
  console.log(board)
  board.updateOne({ _id: this._id }, { $push: { threads: { ok: 'ok' } } })
  console.log('OK')
  console.log(board)
  res.json(board)
  // Redirect to get /b/:board
  // res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
}

// get: /api/threads/:board
// Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const viewBoard = async (req, res) => {
  const board = await Board.find({})
  res.json(board)
}
module.exports = { createBoard, viewBoard }
