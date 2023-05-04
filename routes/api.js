const message = require('../models/message.js')

module.exports = function (app) {
  app.route('/api/threads/:board')

  app.route('/api/replies/:board')
}
