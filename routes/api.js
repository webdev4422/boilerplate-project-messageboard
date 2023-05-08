const { createBoard, viewBoard, deleteThread } = require('../controllers/boardController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board')
  .post(createBoard)
  .get(viewBoard)
  .delete(deleteThread)
  // app.route('/api/threads/:board').post(createThread)
  // app.route('/api/threads/:board').get(viewThread)

  // app.route('/api/replies/:board')
}
