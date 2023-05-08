const { createBoardAndThread, viewBoard, deleteThread, reportThread } = require('../controllers/boardController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board')
  .post(createBoardAndThread)
  .get(viewBoard)
  .delete(deleteThread)
  .put(reportThread)

  // app.route('/api/replies/:board')
}
