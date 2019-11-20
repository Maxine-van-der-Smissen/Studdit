const chai = require('chai');
const expect = chai.expect;

const mongoose = require('mongoose');

const requester = require('../../requester');

const Thread = require('../../scr/models/thread.model');

const baseRoute = '/threads';
const testContent = 'This is test content for the test threads';

describe('Thread router', () => {
    it('POST to /threads creates a new thread', done => {
        const threadProps = {
            title: 'testThread',
            content: testContent,
            username: 'test'
        };

        requester.post(baseRoute)
            .send(threadProps)
            .end((error, res) => {
                Thread.findOne({ title: 'testThread' })
                    .then(thread => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.haveOwnProperty('_id', thread._id.toString());
                        expect(res.body).to.haveOwnProperty('title', 'testThread');
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
        const threadProps = { title: 'testThread', content: testContent, username: 'test' };
        const newContent = 'This is some other content';

        Thread.create(threadProps)
            .then(newThread => {
                requester.put(`${baseRoute}/${newThread.id}`)
                    .send({ content: newContent })
                    .end((error, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.haveOwnProperty('_id', newThread._id.toString());
                        expect(res.body).to.haveOwnProperty('title', 'testThread');
                        expect(res.body).to.haveOwnProperty('content', newContent);
                        expect(res.body).to.haveOwnProperty('username', 'test');
                        done();
                    });
            })
            .catch(console.error);
    });

    it('PUT to /threads/:id fails if id doesn\'t exist', done => {
        const threadProps = { title: 'testThread', content: testContent, username: 'test' };
        const newContent = 'This is some other content';
        const wrongId = new mongoose.Types.ObjectId();

        Thread.create(threadProps)
            .then(newThread => {
                requester.put(`${baseRoute}/${wrongId}`)
                    .send({ content: newContent })
                    .end((error, res) => {
                        expect(res).to.have.status(204);
                        done();
                    });
            })
            .catch(console.error);
    });

    it('Thread with 2 comments with same id fails to save', done => {
        const comment = { _id: new mongoose.Types.ObjectId(), content: 'Test content', username: 'test' };
        const threadProps = { title: 'testThread', content: testContent, username: 'test' };

        Thread.create(threadProps)
            .then(thread => {
                thread.comments.push(comment);
                // console.log(thread.comments);
                threadId = thread._id;
                return thread.save();
            })
            .then(() => Thread.findById(threadId))
            .then(thread => {
                thread.comments.push(comment);
                return thread.save();
            })
            .catch(error => {
                done();
            });
    });

    //Comment tests
    it('POST to /comment/;id without username, fails', done => {
        requester.post(baseRoute + '/'+ new mongoose.Types.ObjectId() + '/comment')
        .send({content: "Test"})
        .end((error, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.haveOwnProperty('error', 'comment validation failed: username: User is required!'); 
            done();
        });
    })

    it('POST to /comment/;id without content, fails', done => {
        requester.post(baseRoute + '/'+ new mongoose.Types.ObjectId() + '/comment')
        .send({username: "Test"})
        .end((error, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.haveOwnProperty('error', 'comment validation failed: content: Content is required!'); 
            done();
        });
    })
});