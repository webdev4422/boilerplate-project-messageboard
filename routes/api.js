const { getThread, postThread, putThread, deleteThread, getReply, postReply, putReply, deleteReply } = require('../controllers/boardController.js')

module.exports = async function (app) {
  // create routes for manipulating threads
  app.route('/api/threads/:board').get(getThread).post(postThread).put(putThread).delete(deleteThread)

  // create routes for manipulating replies
  app.route('/api/replies/:board').get(getReply).post(postReply).put(putReply).delete(deleteReply)
}
