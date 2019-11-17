const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Thread = require('../models/thread.model');

const User = require('../models/user.model');

//Small manual test for thread and comment creation and relations
router.get('/', (req, res) => {
    const user = new User({ username: 'Test User', password: 'Test Password' });
    const thread = new Thread({ title: 'Test Thread', content: 'This is a test thread.', user: user });
    thread.comments.push({ _id: new ObjectId(), content: 'This is a test comment.', user: user });

    user.save()
        .then(() => thread.save())
        .then(() => res.status(200).send({ message: 'Everything went A OK!'}))
        .catch(error => res.status(400).send({ error: error }));
});

module.exports = router;