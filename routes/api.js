const postMessage = require('../controllers/messageController.js')

module.exports = async function (app) {
  app.route('/api/threads/general').post(postMessage)

  app.route('/api/replies/:board')
}
