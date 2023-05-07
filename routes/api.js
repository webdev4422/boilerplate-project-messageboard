const postMessage = require('../controllers/messageController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board').post(postMessage)
  // app.route('/api/threads/:board').get(postMessage)

  app.route('/api/replies/:board')
}
