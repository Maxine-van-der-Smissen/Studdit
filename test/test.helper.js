const mongoose = require('mongoose');

before(done => {
    process.env.NODE_ENV = 'test';
    mongoose.connect('mongodb://localhost/stubbit_test', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, });
    mongoose.connection
        .once('open', () => done())
        .on('error', err => {
            console.warn('Warning', err);
        });
});

beforeEach(done => {
    const { users, threads } = mongoose.connection.collections;
    users.drop()
        .then(() => threads.drop())
        .then(() => done())
        .catch(() => done());
});