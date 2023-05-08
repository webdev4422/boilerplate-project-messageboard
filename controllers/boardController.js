const { Board, Thread, Reply } = require('../models/boardModel.js')

// post: /api/threads/:board board=boardX; text=XXX; delete_password=aaaa
// response: redirect to /b/:board and list all threads
const createBoard = async (req, res) => {
  // Create thread to be pushed on board
  const threadX = await Thread.create({
    text: req.body.text,
    delete_password: req.body.delete_password,
    created_on: Date.now(),
    bumped_on: Date.now(),
    reported: false,
    replies: [],
    replycount: 0,
  })
  // Check if req.body.board exists if not, user should be on board already
  if (!req.body.board) {
    // Find board by url params NOT req.body.board
    const boardY = await Board.find({ board: req.params.board })
    // Update board with thread
    boardY[0].threads.push(threadX)
    await boardY[0].save()
    console.log(`Thread created with id: ${threadX._id}`)
    // return res.json(boardY[0].threads.reverse())
    return res.redirect(303, `/b/${req.params.board}/`) // 303 parameter to make redirect work
  }

  // *** CREATE BOARD ***
  //*************************************************************************** */
  // Check if board exists
  const boardX = await Board.find({ board: req.body.board }) // return array
  // If exists -> response with this board
  if (boardX.length > 0) {
    // Update board with thread
    boardX[0].threads.push(threadX)
    await boardX[0].save()
    console.log('Board found and updated')
    // Redirect to get /b/:board
    return res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work

    // If not exists -> create new board
  } else {
    const boardNew = await Board.create({
      board: req.body.board,
      threads: [threadX],
    })
    console.log('Board created with thread')
    // Redirect to get /b/:board
    return res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
  }
}

// get: /api/threads/:board
// response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const viewBoard = async (req, res) => {
  const boardX = await Board.find({ board: req.params.board })
  console.log('View threads on board')
  // Response with array reverse sorted
  res.json(boardX[0].threads.reverse())
}

const deleteThread = async (req, res) => {
  const threadX = await Thread.findOne({ _id: req.body.thread_id.toString() })
  console.log(threadX)
  console.log('Thread deleted')
  res.send('success')
}

// Create reply var
// const replyX = await Reply.create({
//   text: req.body.text,
//   delete_password: req.body.delete_password,
//   created_on: Date.now(),
//   reported: false,
// })
// console.log(replyX)

module.exports = { createBoard, viewBoard, deleteThread }
