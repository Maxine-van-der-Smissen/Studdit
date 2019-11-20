const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Thread = require('../models/thread.model');

const Comments = require('../models/comment.model');

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

    Thread.findById(threadId)
    .then(thread => {
        if(thread) {
            thread.content = newContent;
            return thread.save()
            .then(thread => res.status(200).send(thread));
        } else {
            res.status(204).send();
        }
    })
    .catch(error => res.status(400).send({ error: error.message }));
});

//Delete the Thread with the given id
router.delete('/:id', (req, res) => {
    const threadId = req.params.id;

    Thread.findById(threadId)
    .then(thread => {
        if(thread) {
            return thread.remove()
            .then(() => res.status(200).send(thread));
        } else {
            res.status(204).send();
        }
    })
    .catch(error => res.status(204).send({ error: error.message }));
});

//Get all Threads without comments
router.get('/', (req, res) => {
    Thread.find({}, { comments: 0 })
    .then(threads => res.status(200).send({ threads: threads, count: threads.length }))
    .catch(error => res.status(400).send({ error: error.message }));
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

//post comment
router.post('/:id/comment', async function (req, res, callback) {
    const threadId = req.params.id;
    const username = req.body.username;
    const content = req.body.content

    const comment = { _id: new mongoose.Types.ObjectId(), content: content, username: username, thread: threadId }

    Thread.findById(threadId)
        .then(thread => {
            if(thread){
                Comments.create(comment)
                .then(comment => res.status(201).send(comment))
                .catch(error => {
                    res.status(400).send({ error: error.message })
                });
            } else {
                res.status(204).send();
            }
        }).catch(error => res.status(401).send({ error: error }));





});

router.delete('/comment/:id', async function (req, res){
    const commentId = req.params.id

    Comments.findById(commentId)
        .then(comment => {
            if(comment){
                Comments.findByIdAndDelete(commentId)
                .then(comment => res.status(200).send(comment))
                .catch(error => res.status(400).send({ error: error }));
            } else {
                res.status(204).send();
            }
        }).catch(error => res.status(401).send({ error: error }));
});



module.exports = router;