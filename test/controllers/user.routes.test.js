const chai = require('chai')
const expect = chai.expect

const requester = require('../../requester')

const User = require('../../scr/models/user.model');

describe('User router', () => {
    it('POST to /users creates a new user', done => {
        const userProps = { username: 'test', password: '1234567890' };

        requester.post('/users')
            .send(userProps)
            .end((error, res) => {
                expect(res).to.have.status(201);
                expect(res.body.username).equals('test');
                done();
            });
    });

    it('POST to /users without username fails', done => {
        requester.post('/users')
        .send( {password: '1234567890' })
        .end((error, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).equals('user validation failed: username: Username is required!');
            done();
        });
    });

    it('POST to /users without password fails', done => {
        requester.post('/users')
        .send({ username: 'test' })
        .end((error, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error).equals('user validation failed: password: Password is required!');
                done();
            });
    });

    it('POST to /users fails if user already exists', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.post('/users')
                    .send({ username: 'test', password: '1234567890' })
                    .end((error, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body.error).equals('user validation failed: username: Error, expected `username` to be unique. Value: `test`');
                        done();
                    });
            });
    });

    it('PUT to /users/:username edits user', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.put('/users/test')
                    .send({ password: '1234567890', newPassword: 'ABCDEF' })
                    .end((error, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.username).equals('test');
                        User.findOne({ username: 'test' })
                        .then(user => {
                            expect(user).to.have.property('password', 'ABCDEF');
                            done();
                        });
                    });
            });
    });

    it('PUT to /users/:username fails if username doesn\'t exist', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.put('/users/WrongName')
                    .send({ password: '1234567890', newPassword: 'ABCDEF' })
                    .end((error, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body.error).equals('Username and password didn\'t match!');
                        done();
                    });
            });
    });

    it('PUT to /users/:username fails if password is wrong', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.put('/users/test')
                    .send({ password: 'ABCDEF', newPassword: '0123456789' })
                    .end((error, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body.error).equals('Username and password didn\'t match!');
                        done();
                    });
            });
    });

    it('DELETE to /users/:username sets the active flag of a user to false', done => {
        User.create({ username: 'test', password: '1234567890' })
        .then(() => {
            requester.delete('/users/test')
            .send({ password: '1234567890' })
            .end((error, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.haveOwnProperty('username', 'test');
                done();
            });
        });
    });

    it('DELETE to /users/:username fails if username doesn\'t exist', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.delete('/users/WrongName')
                    .send({ password: '1234567890' })
                    .end((error, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body.error).equals('Username and password didn\'t match!');
                        done();
                    });
            });
    });

    it('DELETE to /users/:username fails if password is wrong', done => {
        User.create({ username: 'test', password: '1234567890' })
            .then(() => {
                requester.delete('/users/test')
                    .send({ password: 'ABCDEF' })
                    .end((error, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body.error).equals('Username and password didn\'t match!');
                        done();
                    });
            });
    });
});