const mongoose = require('mongoose');

before(done => {
    process.env.NODE_ENV = 'test';
    mongoose.connect('mongodb+srv://test:test123@cluster0-ptq4v.mongodb.net/test?retryWrites=true&w=1', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    mongoose.connection
        .once('open', () => done())
        .on('error', err => {
            console.warn('Warning', err);
        });
});

beforeEach(done => {
    const { users, threads, comments } = mongoose.connection.collections;
    users.drop()
        .then(() => threads.drop())
        .then(() => comments.drop())
        .then(() => done())
        .catch(() => done());
});