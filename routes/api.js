const { postMessage, getMessages } = require('../controllers/messageController.js')

module.exports = async function (app) {
  app.route('/api/threads/:board').post(postMessage)
  app.route('/api/threads/:board').get(getMessages)

  app.route('/api/replies/:board')
}
