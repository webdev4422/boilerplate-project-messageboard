const messageController = require('../controllers/message-controller.js')
const Message = require('../models/message.js')

module.exports = async function (app) {
  // post: /api/threads/general text=test; delete_password=aaaa
  // Response: // [{"_id":"6456b218ad743174db9b6dd0","text":"testXXX","created_on":"2023-05-06T20:01:28.805Z","bumped_on":"2023-05-06T20:01:28.805Z","replies":[],"replycount":0}]
  app.route('/api/threads/general').post((req, res) => {
    const messageX = new Message({
      text: req.body.text,
      password: req.body.delete_password,
      created_on: Date.now(),
      bumped_on: Date.now(),
      replies: [],
      replycount: 0,
    })
      .save()
      .then((data) => res.json(data))
  })

  app.route('/api/replies/:board')
  // app.route('/api/threads/general').post((app) => {
  // const messagesCollection = await Message.find()
  // console.log(messagesCollection)
  // })
  // Drop DB for test purpose
  // await Message.collection.drop()
}
