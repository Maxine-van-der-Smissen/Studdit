const chai = require('chai');
const expect = chai.expect;

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const requester = require('../../requester');

const Thread = require('../../scr/models/thread.model');
const Comment = require('../../scr/models/comment.model');

const baseRoute = '/threads';
const testContent = 'This is test content for the test threads';

describe('Thread router', () => {
    let threadID;

    beforeEach(done => {
        const threadProps = { title: 'testThread', content: testContent, username: 'test' };
        Thread.create(threadProps)
            .then(newThread => {
                threadID = newThread._id;
                done();
            });
    });

    it('POST to /threads creates a new thread', done => {
        const threadProps = {
            title: 'Create a Thread',
            content: testContent,
            username: 'test'
        };

        requester.post(baseRoute)
            .send(threadProps)
            .end((error, res) => {
                Thread.findOne({ title: 'Create a Thread' })
                    .then(thread => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.haveOwnProperty('_id', thread._id.toString());
                        expect(res.body).to.haveOwnProperty('title', 'Create a Thread');
                        expect(res.body).to.haveOwnProperty('content', testContent);
                        expect(res.body).to.haveOwnProperty('username', 'test');
                        done();
                    });
            });
    });

    it('POST to /threads without title fails', done => {
        const threadProps = {
            content: testContent,
            username: 'test'
        };

        requester.post(baseRoute)
            .send(threadProps)
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'thread validation failed: title: Title is required!');
                done();
            });
    });

    it('POST to /threads without title fails', done => {
        const threadProps = {
            title: 'testThread',
            username: 'test'
        };

        requester.post(baseRoute)
            .send(threadProps)
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'thread validation failed: content: Content is required!');
                done();
            });
    });

    it('POST to /threads without title fails', done => {
        const threadProps = {
            title: 'testThread',
            content: testContent
        };

        requester.post(baseRoute)
            .send(threadProps)
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'thread validation failed: username: User is required!');
                done();
            });
    });

    it('PUT to /threads/:id can change threads content', done => {
        const newContent = 'This is some other content';

        requester.put(`${baseRoute}/${threadID}`)
            .send({ content: newContent })
            .end((error, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.haveOwnProperty('_id', threadID.toString());
                expect(res.body).to.haveOwnProperty('title', 'testThread');
                expect(res.body).to.haveOwnProperty('content', newContent);
                expect(res.body).to.haveOwnProperty('username', 'test');
                done();
            });
    });

    it('PUT to /threads/:id fails if id doesn\'t exist', done => {
        const newContent = 'This is some other content';
        const wrongId = new ObjectId();

        requester.put(`${baseRoute}/${wrongId}`)
            .send({ content: newContent })
            .end((error, res) => {
                expect(res).to.have.status(204);
                done();
            });
    });

    it('PUT to /threads/:id fails if content is not defined', done => {
        requester.put(`${baseRoute}/${threadID}`)
            .send({})
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'thread validation failed: content: Content is required!');
                done();
            });
    });

    it('DELETE to /threads/:id deletes the thread and it\'s comments', done => {
        const commentProps = { username: 'test', content: 'This is test content', thread: threadID, parent: threadID };
        let commentId;

        Comment.create(commentProps)
            .then(comment => {
                commentId = comment._id;
                requester.delete(`${baseRoute}/${threadID}`)
                    .end((error, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.haveOwnProperty('_id', threadID.toString());
                        expect(res.body).to.haveOwnProperty('title', 'testThread');
                        expect(res.body).to.haveOwnProperty('content', testContent);
                        expect(res.body).to.haveOwnProperty('username', 'test');
                        Comment.findById(commentId)
                            .then(com => {
                                expect(com).to.be.null;
                                done();
                            });
                    });
            })
    });

    it('DELETE to /threads/:id fails if id doesn\'t exist', done => {
        requester.delete(`${baseRoute}/${new ObjectId()}`)
            .end((error, res) => {
                expect(res).to.have.status(204);
                expect(res.body).to.be.empty;
                done();
            });
    });
});

describe('Thread router for comments', () => {
    let threadID;
    let commentID;

    beforeEach(done => {
        const threadProps = { title: 'testThread', content: testContent, username: 'test' };

        Thread.create(threadProps)
            .then(newThread => {
                threadID = newThread._id;
                const commentProps = { username: 'test', content: 'Test', thread: threadID, parent: threadID };

                return Comment.create(commentProps);
            })
            .then(comment => {
                commentID = comment._id;
                done();
            });
    });

    it('POST to /comment/:id can create a comment with a thread as parent', done => {
        const commentProps = { username: 'test', content: 'Test', parent: threadID };

        requester.post(`${baseRoute}/${threadID}/comment`)
            .send(commentProps)
            .end((error, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.haveOwnProperty('username', 'test');
                expect(res.body).to.haveOwnProperty('content', 'Test');
                expect(res.body).to.haveOwnProperty('thread', threadID.toString());
                expect(res.body).to.haveOwnProperty('parent', threadID.toString());
                done();
            });
    });

    it('POST to /comment/:id can create a comment with a comment as parent', done => {
        const commentProps1 = { username: 'test', content: 'Test', thread: threadID, parent: threadID };
        const commentProps2 = { username: 'test', content: 'Test' };

        Comment.create(commentProps1)
            .then(comment => {
                commentProps2.parent = comment._id;
                requester.post(`${baseRoute}/${threadID}/comment`)
                    .send(commentProps2)
                    .end((error, res) => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.haveOwnProperty('username', 'test');
                        expect(res.body).to.haveOwnProperty('content', 'Test');
                        expect(res.body).to.haveOwnProperty('thread', threadID.toString());
                        expect(res.body).to.haveOwnProperty('parent', comment._id.toString());
                        done();
                    });
            });
    });

    it('POST to /comment/:id without username, fails', done => {
        const commentProps = { content: 'Test', parent: threadID };

        requester.post(`${baseRoute}/${threadID}/comment`)
            .send(commentProps)
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'comment validation failed: username: User is required!');
                done();
            });
    });

    it('POST to /comment/:id without content, fails', done => {
        const commentProps = { username: 'test', parent: threadID };

        requester.post(`${baseRoute}/${threadID}/comment`)
            .send(commentProps)
            .end((error, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.haveOwnProperty('error', 'comment validation failed: content: Content is required!');
                done();
            });
    });
});