'use strict'
const { Reply, Thread } = require('../models/boardModel.js')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')

// reply get request - retried a single thread with all replies - responds with the thread with replies
const getReply = async (req, res) => {
  // get data from url and query variables
  const board = req.params.board
  let thread_id = req.query.thread_id

  // if thread id was supplied, find the thread
  if (thread_id) {
    // verify thread_id is a valid database object ID, respond with string 'invalid id' otherwise
    try {
      thread_id = ObjectId(thread_id)
    } catch (e) {
      return res.send('invalid id')
    }

    // perform database search, returning results without reported or password fields
    Thread.findOne({ board: board, _id: thread_id })
      .select('-reported -delete_password -__v -replies.reported -replies.delete_password')
      .exec((err, thread) => {
        if (err) {
          return res.send(err)
        } // if any errors, send response with the error
        if (!thread) {
          return res.send('invalid board/id')
        } // if no thread returned, send response stating 'invalid board/id'

        // If valid thread found, send json response with that thread
        return res.json(thread)
      })

    // if thread id wasn't supplied, response with string 'missing required fields'
  } else {
    return res.send('missing required fields')
  }
}

// reply post request - create new reply given thread id, text and password - response with reply json object and updates bumped date
const postReply = async (req, res) => {
  // get data from url and request body
  const board = req.params.board
  let { text, delete_password, thread_id } = req.body

  // if all required data supplied, retrieve desired thread, and append new reply
  if (text && delete_password && thread_id) {
    // verify thread_id is a valid database object ID, respond with string 'invalid id' otherwise
    try {
      thread_id = ObjectId(thread_id)
    } catch (e) {
      return res.send('invalid id')
    }

    // retreive thread from database with board and thread id
    Thread.findOne({ board: board, _id: thread_id }, (err, thread) => {
      if (err) {
        return res.send(err)
      } // if error, response with error text
      if (!thread) {
        return res.send('invalid board/id')
      } // if no thread returned, respond with 'invalid board/id'

      // push new reply to the thread with data and hashed password, update bumped on date, and save thread
      let myreply = new Reply({ text: text, delete_password: bcrypt.hashSync(delete_password, 4) })
      thread.replies.push(myreply)
      thread.bumped_on = myreply.created_on
      thread.save((err) => {
        if (err) {
          return res.send(err)
        }

        // after save completes, send json response with the reply object
        return res.json(thread.replies[thread.replies.length - 1])
      })
    })

    // if not all data supplied, send response 'missing required fields'
  } else {
    return res.send('missing required fields')
  }
}

// reply put requests - updates the reported field on reply to true - response with text 'reported'
const putReply = async (req, res) => {
  // get data from urls and request body
  const board = req.params.board
  let { thread_id, reply_id } = req.body

  // if thread and reply ids are supplied, proceed with database lookup
  if (thread_id && reply_id) {
    // verify thread and reply IDs are valid database object ids, if not respond 'invalid id'
    try {
      thread_id = ObjectId(thread_id)
      reply_id = ObjectId(reply_id)
    } catch (e) {
      return res.send('invalid id')
    }

    // retrieve desired thread object from database
    Thread.findOne({ _id: thread_id, board: board }, (err, thread) => {
      if (err) {
        return res.send(err)
      } // on error send error response
      if (!thread) {
        return res.send('invalid board/id')
      } // if no thread found respond 'invalid board/id'

      // retrieve desired reply object
      let reply = thread.replies.id(reply_id)

      // if reply found, change reported to true and save database
      if (reply) {
        reply.reported = true
        thread.save((err) => {
          if (err) {
            return res.send(err)
          }

          // send string response 'reported'
          return res.send('reported')
        })

        // if reply not found, respond 'invalid id'
      } else {
        return res.send('invalid id')
      }
    })

    // if either id wasn't supplied, respond with 'missing required field'
  } else {
    return res.send('missing required field')
  }
}

// reply delete request - marks reply as deleted - responds with success
const deleteReply = async (req, res) => {
  // get data from URL and request body
  const board = req.params.board
  let { thread_id, reply_id, delete_password } = req.body

  // if required data is supplied, proceed with retrieving object
  if (thread_id && delete_password && reply_id) {
    // verify id's are valid object ids, if not respond 'invalid id'
    try {
      thread_id = ObjectId(thread_id)
      reply_id = ObjectId(reply_id)
    } catch (e) {
      return res.send('invalid id')
    }

    // retrieve desired thread from database with board and thread id
    Thread.findOne({ _id: thread_id, board: board }, (err, thread) => {
      if (err) {
        return res.send(err)
      } // if error, respond with error
      if (!thread) {
        return res.send('invalid board/id')
      } // if thread not found, respond 'invalid board/id'

      // retrieve desired reply from thread
      let reply = thread.replies.id(reply_id)

      // if reply found, verify the password, and set reply's text to '[deleted]' and save
      if (reply) {
        if (bcrypt.compareSync(delete_password, reply.delete_password)) {
          reply.text = '[deleted]'
          thread.save((err) => {
            if (err) {
              return res.send(err)
            }

            // send text response with 'success'
            return res.send('success')
          })

          // if password is invalid, respond with 'incorrect password'
        } else {
          return res.send('incorrect password')
        }

        // if thread not found, respond with 'invalid id'
      } else {
        return res.send('invalid id')
      }
    })

    // if not all fields supplied, reply 'missing required fields'
  } else {
    return res.send('missing required fields')
  }
}

module.exports = { getReply, postReply, putReply, deleteReply }
