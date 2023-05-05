const Message = require('../models/message.js')

module.exports = async function (app) {
  // Create object
  const messageX = new Message({
    text: '111111111111111111111',
    password: 'aaaa',
  }).save()

  const messageY = new Message({
    text: '222222222222222222222',
    password: 'bbbb',
  }).save()

  const messagesCollection = await Message.find()
  console.log(messagesCollection)

  app.route('/api/threads/:board')

  app.route('/api/replies/:board')

  // Drop DB for test purpose
  // await Message.collection.drop()
}
