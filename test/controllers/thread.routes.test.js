const chai = require('chai');
const expect = chai.expect;

const requester = require('../../requester')

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

    // it('PUT to /threads/:id can change users password', done => {

    // });
});