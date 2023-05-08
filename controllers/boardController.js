const { Board, Thread, Reply } = require('../models/boardModel.js')

// post: /api/threads/:board board=boardX; text=XXX; delete_password=aaaa
const createBoard = async (req, res) => {
  // *** HOLD PROPS IN VARIABLES ***
  // Create thread var
  const threadX = await Thread.create({
    text: req.body.text,
    delete_password: req.body.delete_password,
    created_on: Date.now(),
    bumped_on: Date.now(),
    reported: false,
    replies: [],
    replycount: 0,
  })
  // console.log(threadX)

  // Create reply var
  // const replyX = await Reply.create({
  //   text: req.body.text,
  //   delete_password: req.body.delete_password,
  //   created_on: Date.now(),
  //   reported: false,
  // })
  // console.log(replyX)

  // *** CREATE BOARD ***
  //*************************************************************************** */
  // Check if board exists
  const boardX = await Board.find({ board: req.body.board }) // return array
  // If exists -> response with this board
  if (boardX.length > 0) {
    // Update board
    boardX[0].threads.push(threadX)
    await boardX[0].save()
    console.log('Board found and updated!')
    res.json(boardX)
    return
    // Redirect to get /b/:board
    // return res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work

    // If not exists -> create new board
  } else {
    const boardNew = await Board.create({
      board: req.body.board,
      threads: [threadX],
    })
    console.log(boardNew)
    console.log('Board created with thread')
    res.json(boardNew)
    // Redirect to get /b/:board
    // return res.redirect(303, `/b/${req.body.board}/`) // 303 parameter to make redirect work
  }
}

// get: /api/threads/:board
// Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
const viewBoard = async (req, res) => {
  console.log(req.params.board)
  const boardX = await Board.find({ board: req.params.board })
  // console.log(boardX)
  res.json(boardX)
  // res.json('ok')
}
module.exports = { createBoard, viewBoard }
