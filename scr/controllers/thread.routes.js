const express = require('express');
const router = express.Router();

const Thread = require('../models/thread.model');

const User = require('../models/user.model');

//Deprication safe settings for removing or updating using the model
const updateRemoveSettings = { useFindAndModify: false };

//Create new thread
router.post('/', (req, res) => {
    const threadProps = req.body;
    Thread.create(threadProps)
        .then(thread => res.status(201).send(thread))
        .catch(error => {
            res.status(400).send({ error: error.message })
        });
});

//Change the content of the Thread with the given id
router.put('/:id', (req, res) => {
    const threadId = req.params.id;
    const newContent = req.body.content;

    Thread.findByIdAndUpdate(threadId, { content: newContent }, updateRemoveSettings)
        .then(() => Thread.findById(threadId))
        .then(thread => res.status(200).send(thread))
        .catch(error => res.status(400).send({ error: error }));
});

//Delete the Thread with the given id
router.delete('/:id', (req, res) => {
    const threadId = req.params.id;

    Thread.findByIdAndDelete(threadId)
    .then(thread => res.status(200).send(thread))
    .catch(error => res.status(400).send({ error: error }));
});

//Get all Threads without comments
router.get('/', (req, res) => {
    Thread.find({}, { comments: 0 })
    .then(threads => res.status(200).send({ threads: threads, count: threads.length }))
    .catch(error => res.status(400).send({ error: error}));
});

//Get the Thread with the given id with comments
router.get('/:id', (req, res) => {
    const threadId = req.params.id;

    Thread.findById(threadId)
    .then(thread => res.status(200).send({
        _id: thread._id,
        title: thread.title,
        content: thread.content,
        username: thread.username,
        comments: thread.comments
    }))
    .catch(error => res.status(400).send({ error: error}));
});

module.exports = router;