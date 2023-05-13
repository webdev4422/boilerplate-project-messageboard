'use strict'
const { Reply, Thread } = require('../models/boardModel.js')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')

const ThreadController = class {
  // thread get request - returns with json object containing at max 10 threads, and 3 replies each, hiding password and reported fields
  static async getThread(req, res) {
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
        console.log(`getThread view thrads: ${results.length}`)
        return res.json(results)
      })
  }

  // thread post request - creates a new thread when supplied with text and password - response with the thread
  static async postThread(req, res) {
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
        console.log(`postThread created: ${obj._id}`)
        return res.json(obj)
      })

      // if not all data was supplied, reply with missing required fields
    } else {
      return res.send('missing required fields')
    }
  }

  // Thread put request - reports a thread, responds with the string reported on success
  static async putThread(req, res) {
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
          console.log(`putThread reported id: ${thread_id}`)
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
  }

  // thread delete request - delete thread with supplied id and password- responds with success on completion
  static async deleteThread(req, res) {
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
              console.log(`deleteThred id: ${thread_id}`)
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
  }
}
// module.exports = { getThread, postThread, putThread, deleteThread }
module.exports = ThreadController
