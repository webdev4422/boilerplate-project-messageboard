// const { getThread, postThread, putThread, deleteThread } = require('../controllers/threadController.js')
// const { getReply, postReply, putReply, deleteReply } = require('../controllers/replyController.js')
const ThreadController = require('../controllers/threadController.js')
const ReplyController = require('../controllers/replyController.js')

module.exports = async function (app) {
  // create routes for manipulating threads
  app
    .route('/api/threads/:board')
    .get(ThreadController.getThread)
    .post(ThreadController.postThread)
    .put(ThreadController.putThread)
    .delete(ThreadController.deleteThread)

  // create routes for manipulating replies
  app
    .route('/api/replies/:board')
    .get(ReplyController.getReply)
    .post(ReplyController.postReply)
    .put(ReplyController.putReply)
    .delete(ReplyController.deleteReply)
}
