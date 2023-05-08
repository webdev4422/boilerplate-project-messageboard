const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  this.timeout(5000)
  let thread_id = 0
  let reply_id = 0
  let delete_passwords = 'chaitestpw'

  suite('Tests To Create/Edit Threads', function () {
    test('Creating a new thread: POST request to /api/threads/{board}', (done) => {
      chai
        .request(server)
        .post('/api/threads/tester')
        .send({ text: 'This is a Chai Test Post!', delete_password: delete_passwords })
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.body.board, 'tester', 'Reply should contain thread with board ID of tester')
          assert.equal(res.body.text, 'This is a Chai Test Post!', 'Reply should contain thread with requested text')
          assert.equal(res.body.created_on.slice(0, 16), res.body.bumped_on.slice(0, 16), 'Reply bumped_on and created_on date should be equal to the second')
          assert.isFalse(res.body.reported, 'Reply should contain thread with reported field set to false')
          assert.isDefined(res.body._id, 'Reply should have a valid database ID')
          thread_id = res.body._id
          done()
        })
    })

    test('Reporting a thread: PUT request to /api/threads/{board}', (done) => {
      chai
        .request(server)
        .put('/api/threads/tester')
        .send({ thread_id: thread_id })
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.text, 'reported', "Reply should contain the string 'reported'")
          done()
        })
    })

    test('Creating a new reply: POST request to /api/replies/{board}', (done) => {
      chai
        .request(server)
        .post('/api/replies/tester')
        .send({ thread_id: thread_id, text: 'This is a Chai Test Reply 1!', delete_password: delete_passwords })
        .end((err, res) => {
          const datenow = new Date().toISOString().slice(0, 15)
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.body.text, 'This is a Chai Test Reply 1!', 'Reply threads latest reply should contain the text supplied.')
          assert.isDefined(res.body._id, 'Latest reply should have a valid database ID set')
          assert.equal(res.body.created_on.slice(0, 15), datenow, 'Reply created_on date should be equal to now up to 10s of seconds')
          assert.isFalse(res.body.reported, 'Reply should have a reported field set to false')
          reply_id = res.body._id
          chai
            .request(server)
            .get(`/api/replies/tester?thread_id=${thread_id}`)
            .end((err1, res1) => {
              assert.isAbove(
                new Date(res1.body.bumped_on),
                new Date(res1.body.created_on),
                'Replied threads bumped_on date should be greater than created_on date'
              )
              done()
            })
        })
    })

    test('Create four more replies for get testing: POST request to /api/replies/{board}', (done) => {
      chai
        .request(server)
        .post('/api/replies/tester')
        .send({ thread_id: thread_id, text: 'This is a Chai Test Reply 2!', delete_password: delete_passwords })
        .end((err, res) => {
          assert.equal(res.body.text, 'This is a Chai Test Reply 2!', 'Reply should contain the reply 2 text supplied.')
          chai
            .request(server)
            .post('/api/replies/tester')
            .send({ thread_id: thread_id, text: 'This is a Chai Test Reply 3!', delete_password: delete_passwords })
            .end((err, res) => {
              assert.equal(res.body.text, 'This is a Chai Test Reply 3!', 'Reply should contain the reply 3 text supplied.')
              chai
                .request(server)
                .post('/api/replies/tester')
                .send({ thread_id: thread_id, text: 'This is a Chai Test Reply 4!', delete_password: delete_passwords })
                .end((err, res) => {
                  assert.equal(res.body.text, 'This is a Chai Test Reply 4!', 'Reply should contain the reply 4 text supplied.')
                  chai
                    .request(server)
                    .post('/api/replies/tester')
                    .send({ thread_id: thread_id, text: 'This is a Chai Test Reply 5!', delete_password: delete_passwords })
                    .end((err, res) => {
                      assert.equal(res.body.text, 'This is a Chai Test Reply 5!', 'Reply should contain the reply 5 text supplied.')
                      done()
                    })
                })
            })
        })
    })

    test('Reporting a reply: PUT request to /api/replies/{board}', (done) => {
      chai
        .request(server)
        .put('/api/replies/tester')
        .send({ thread_id: thread_id, reply_id: reply_id })
        .end((err, res) => {
          console.log(thread_id, reply_id)
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.text, 'reported', "Reply should contain the string 'reported'")
          done()
        })
    })
  })

  suite('Tests To Retrieve Threads', function () {
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
      chai
        .request(server)
        .get('/api/threads/tester')
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.lengthOf(res.body, 10, 'Reply should return 10 thread items')
          assert.equal(res.body[0]._id, thread_id, 'The first threads ID should match the test post ID')
          assert.isUndefined(res.body[0].reported, 'The test post reported field should not be supplied')
          assert.isUndefined(res.body[0].delete_password, 'The test post deleted password field should not be supplied')
          assert.lengthOf(res.body[0].replies, 3, 'The test post replies array should be length 3 (out of 5 total)')
          assert.equal(res.body[0].replies[2].text, 'This is a Chai Test Reply 5!', 'The last replies should be the latest test reply # 5')
          assert.isUndefined(res.body[0].replies[2].reported, 'The replies reported field should not be supplied')
          assert.isUndefined(res.body[0].replies[2].delete_password, 'The replies deleted password field should not be supplied')
          done()
        })
    })

    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
      chai
        .request(server)
        .get(`/api/replies/tester?thread_id=${thread_id}`)
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.body._id, thread_id, 'Retrieved thread ID should match test thread ID')
          assert.isUndefined(res.body.reported, 'The test post reported field should not be supplied')
          assert.isUndefined(res.body.delete_password, 'The test post deleted password field should not be supplied')
          assert.lengthOf(res.body.replies, 5, 'Retrieved threads replies list should have all entries (5)')
          assert.isUndefined(res.body.replies[0].reported, 'The replies reported field should not be supplied')
          assert.isUndefined(res.body.replies[0].delete_password, 'The replies deleted password field should not be supplied')
          done()
        })
    })
  })

  suite('Tests to Delete Threads', function () {
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
      chai
        .request(server)
        .delete('/api/replies/tester')
        .send({ thread_id: thread_id, reply_id: reply_id, delete_password: 'incorrectpassword' })
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.text, 'incorrect password', "Reply should contain text 'incorrect password'")
          chai
            .request(server)
            .get(`/api/replies/tester?thread_id=${thread_id}`)
            .end((err, res) => {
              assert.lengthOf(res.body.replies, 5, 'Retrieved threads replies list should still have 5 entries 5')
              done()
            })
        })
    })

    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
      chai
        .request(server)
        .delete('/api/replies/tester')
        .send({ thread_id: thread_id, reply_id: reply_id, delete_password: delete_passwords })
        .end((err, res) => {
          assert.equal(res.status, 200, 'Reply status should be valid status 200')
          assert.equal(res.text, 'success', "Reply should contain text 'success'")
          chai
            .request(server)
            .get(`/api/replies/tester?thread_id=${thread_id}`)
            .end((err, res) => {
              assert.equal(res.body.replies[0].text, '[deleted]', 'Retrieved threads replies list should now have 4 entries')
              done()
            })
        })
    })

    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
      chai
        .request(server)
        .delete('/api/threads/tester')
        .send({ thread_id: thread_id, delete_password: 'incorrectpassword' })
        .end((err, res) => {
          assert.equal(res.text, 'incorrect password', "Reply should contain text 'incorrect password'")
          chai
            .request(server)
            .get(`/api/replies/tester?thread_id=${thread_id}`)
            .end((err, res) => {
              assert.equal(res.body._id, thread_id, 'Should still be able to retrieve the thread')
              done()
            })
        })
    })

    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
      chai
        .request(server)
        .delete('/api/threads/tester')
        .send({ thread_id: thread_id, delete_password: delete_passwords })
        .end((err, res) => {
          assert.equal(res.text, 'success', "Reply should contain text 'success'")
          chai
            .request(server)
            .get(`/api/replies/tester?thread_id=${thread_id}`)
            .end((err, res) => {
              assert.equal(res.text, 'invalid board/id', "Attempt to retried deleted thread should return 'invalid board/id'")
              done()
            })
        })
    })
  })
})
