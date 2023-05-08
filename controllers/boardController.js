'use strict'
const { Reply, Thread } = require('../models/boardModel.js')

const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')

// thread get request - returns with json object containing at max 10 threads, and 3 replies each, hiding password and reported fields
const getThread = async function((req, res) => {
  // get board name from URL
  const board = req.params.board
  let results = []

  // request database to reply with at least 10 boards, sorted by bumped on date, minus reported and pw fields
  Thread.find({ board: board })
    .sort('-bumped_on')
    .limit(10)
    .select('-reported -delete_password -__v -replies.reported -replies.delete_password')
    .exec((err, data) => {
      if (err) {
        return res.send(err)
      } // report errors if any

      // Go through resulting threads and limit replies to three
      results = data.map((thread) => {
        thread.replies = thread.replies.slice(-3)
        return thread
      })

      // Send json response with data
      return res.json(results)
    })
})

// thread post request - creates a new thread when supplied with text and password - response with the thread
postThread((req, res) => {
  // get data from URL and the body of the request
  const board = req.params.board
  const { text, delete_password } = req.body

  // if data is present, create the thread with hashed password
  if (text && delete_password) {
    Thread.create({ board: board, text: text, delete_password: bcrypt.hashSync(delete_password, 4) }, (err, obj) => {
      if (err) {
        return res.send(err)
      }

      // on success send json response with thread object
      return res.json(obj)
    })

    // if not all data was supplied, reply with missing required fields
  } else {
    return res.send('missing required fields')
  }
})

// Thread put request - reports a thread, responds with the string reported on success
putThread((req, res) => {
  // get data from URL and the body of the request
  const board = req.params.board
  let thread_id = req.body.thread_id

  // if thread ID supplied, perform find and update on that thread ID to set reported to true
  if (thread_id) {
    // verify thread_id is a valid database object ID, respond with string 'invalid id' otherwise
    try {
      thread_id = ObjectId(thread_id)
    } catch (e) {
      return res.send('invalid id')
    }

    // perform find and update on desired thread
    Thread.findOneAndUpdate({ _id: thread_id, board: board }, { reported: true }, (err, obj) => {
      if (err) {
        return res.send(err)
      } // report any errors
      if (obj) {
        return res.send('reported')
      } // if object is returned, respond with string 'success'
      else {
        return res.send('invalid board/id')
      } // if no object returned, respond with string 'invalid board/id'
    })

    // if no valid thread_id supplied, reply with 'missing required fields'
  } else {
    return res.send('missing required field')
  }
})

// thread delete request - delete thread with supplied id and password- responds with success on completion
deleteThread((req, res) => {
  // get data from URL and the body of the request
  const board = req.params.board
  let { thread_id, delete_password } = req.body

  // if id and password supplied, perform database search to find the desired thread
  if (thread_id && delete_password) {
    // verify thread_id is a valid database object ID, respond with string 'invalid id' otherwise
    try {
      thread_id = ObjectId(thread_id)
    } catch (e) {
      return res.send('invalid id')
    }

    Thread.findOne({ _id: thread_id, board: board }, (err, thread) => {
      if (err) {
        return res.send(err)
      } // print any errors that occur
      if (!thread) {
        return res.send('invalid board/id')
      } // if no thread returned, respond with 'invalid board/id'

      // if retrieved threads password matches the supplied password, delete thread
      if (bcrypt.compareSync(delete_password, thread.delete_password)) {
        thread.delete((err) => {
          if (err) {
            return res.send(err)
          } else {
            return res.send('success')
          } // if no error, respond with string 'success'
        })

        // if password doesn't match, respond with string 'incorrect password'
      } else {
        return res.send('incorrect password')
      }
    })

    // if id or password wasn't supplied, respond with 'missing required fields'
  } else {
    return res.send('missing required fields')
  }
})

// reply get request - retried a single thread with all replies - responds with the thread with replies
getReply((req, res) => {
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
})

// reply post request - create new reply given thread id, text and password - response with reply json object and updates bumped date
postReply((req, res) => {
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
})

// reply put requests - updates the reported field on reply to true - response with text 'reported'
putReply((req, res) => {
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
})

// reply delete request - marks reply as deleted - responds with success
deleteReply((req, res) => {
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
})

module.exports = { getThread, postThread, putThread, deleteThread }
// With best regards to https://github.com/kinome79/FCC-Message-Board
