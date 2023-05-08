const { createBoard, viewBoard } = require('../controllers/boardController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board').post(createBoard)
  app.route('/api/threads/:board').get(viewBoard)
  // app.route('/api/threads/:board').post(createThread)
  // app.route('/api/threads/:board').get(viewThread)

  // app.route('/api/replies/:board')
}
