const { createThread, viewThread } = require('../controllers/threadController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board').post(createThread)
  app.route('/api/threads/:board').get(viewThread)

  app.route('/api/replies/:board')
}
