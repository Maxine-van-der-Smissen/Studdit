const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Thread = require('../models/thread.model');
const Comments = require('../models/comment.model');
const User = require('../../scr/models/user.model');

//Deprication safe settings for removing or updating using the model
const updateRemoveSettings = { useFindAndModify: false };

//compare function for upvotes
function compare( a, b ) {
    if ( a.upvotes < b.upvotes ){
      return 1;
    }
    if ( a.upvotes > b.upvotes ){
      return -1;
    }
    return 0;
  }

  //compare function for difference between up and down votes
  function compareDifference( a, b ) {
    if ( a.amountVotes < b.amountVotes ){
      return 1;
    }
    if ( a.amountVotes > b.amountVotes ){
      return -1;
    }
    return 0;
  }

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
            if (thread) {
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
            if (thread) {
                return thread.remove()
                    .then(() => Comments.deleteMany({ thread: threadId }))
                    .then(() => res.status(200).send(thread));
            } else {
                res.status(204).send();
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

//Get all Threads without comments
router.get('/', (req, res) => {
    const sort = req.body.sort;
    if(sort == 'upvotes'){
        Thread.find({}, { __v: 0 })
        .then(threads => {
            console.log(threads[0].upvotes)
            res.status(200).send({ threads: threads.sort(compare), count: threads.length 
            })})
        .catch(error => res.status(400).send({ error: error.message }));
    } else if (sort == 'votes') {
        Thread.find({}, { __v: 0 })
        .then(threads => {
            console.log(threads[0].upvotes)
            res.status(200).send({ threads: threads.sort(compareDifference), count: threads.length 
            })})
        .catch(error => res.status(400).send({ error: error.message }));
    } else{
    Thread.find({}, { __v: 0 })
        .then(threads => res.status(200).send({ threads: threads, count: threads.length }))
        .catch(error => res.status(400).send({ error: error.message }));
    }
});

//Get the Thread with the given id with comments
router.get('/:id', (req, res) => {
    const threadId = req.params.id;
    let thread;
    let comments;
    let query;

    Thread.findById(threadId)
        .then(thrd => {
            if (thrd) {
                thread = thrd;
            Comments.find({ thread: threadId }).sort({})
                    .then(coms => comments = coms)
                    .then(() => res.status(200).send({
                        _id: thread._id,
                        title: thread.title,
                        content: thread.content,
                        username: thread.username,
                        comments: comments,
                        votes: thread.votes
                    }));
            } else res.status(204).send();
        })
        .catch(error => res.status(400).send({ error: error }));
});

router.post('/:id/upvote', (req, res) => {
    const threadId = req.params.id;
    const username = req.body.username;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                throw new Error();
            }
        })
        .then(() => Thread.findById(threadId))
        .then(thread => {
            if (thread) {
                return Thread.findOne({ _id: threadId, "votes.username": username }, { "votes.$": 1 });
            }
            else throw new Error();
        })
        .then(thread => {
            if (thread) {
                thread.votes[0].voteType = true;
                return thread.save()
                    .then(thread => {
                        delete thread.votes;
                        res.status(200).send(thread);
                    });
            } else {
                Thread.findById(threadId)
                    .then(thread => {
                        if (thread) {
                            thread.votes.push({ username: username, voteType: true });
                            return thread.save()
                                .then(thread => {
                                    delete thread.votes;
                                    res.status(200).send(thread);
                                });
                        } else {
                            cont = false;
                            return res.status(204).send();
                        }
                    });
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

router.post('/:id/downvote', (req, res) => {
    const threadId = req.params.id;
    const username = req.body.username;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                throw new Error();
            }
        })
        .then(() => Thread.findById(threadId))
        .then(thread => {
            if (thread) {
                return Thread.findOne({ _id: threadId, "votes.username": username }, { "votes.$": 1 });
            }
            else throw new Error();
        })
        .then(thread => {
            if (thread) {
                thread.votes[0].voteType = false;
                return thread.save()
                    .then(thread => {
                        delete thread.votes;
                        res.status(200).send(thread);
                    });
            } else {
                Thread.findById(threadId)
                    .then(thread => {
                        if (thread) {
                            thread.votes.push({ username: username, voteType: false });
                            return thread.save()
                                .then(thread => {
                                    delete thread.votes;
                                    res.status(200).send(thread);
                                });
                        } else {
                            cont = false;
                            return res.status(204).send();
                        }
                    });
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

//post comment
router.post('/:id/comment', (req, res) => {
    const threadId = req.params.id;
    const { username, content, parent } = req.body;

    const comment = { content: content, username: username, thread: threadId, parent: parent };

    Thread.findById(threadId)
        .then(thread => {
            if (thread) {
                Comments.create(comment)
                    .then(comment => res.status(201).send(comment))
                    .catch(error => {
                        res.status(400).send({ error: error.message })
                    });
            } else {
                res.status(204).send();
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

router.delete('/comment/:id', async function (req, res) {
    const commentId = req.params.id

    Comments.findById(commentId)
        .then(comment => {
            if (comment) {
                Comments.findByIdAndDelete(commentId)
                    .then(comment => res.status(200).send(comment))
                    .catch(error => res.status(400).send({ error: error.message }));
            } else {
                res.status(204).send();
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

router.post('/comment/:id/upvote', (req, res) => {
    const commentId = req.params.id;
    const username = req.body.username;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                throw new Error();
            } else {
                return Comments.findById(commentId);
            }
        })
        .then(comment => {
            if (comment) {
                return Comments.findOne({ _id: commentId, "votes.username": username }, { "votes.$": 1 });
            }
            else throw new Error();
        })
        .then(comment => {
            if (comment) {
                comment.votes[0].voteType = true;
                return comment.save()
                    .then(comment => {
                        delete comment.votes;
                        res.status(200).send(comment);
                    });
            } else {
                Comments.findById(commentId)
                    .then(comment => {
                        if (comment) {
                            comment.votes.push({ username: username, voteType: true });
                            return comment.save()
                                .then(comment => {
                                    delete comment.votes;
                                    res.status(200).send(comment);
                                });
                        } else {
                            cont = false;
                            return res.status(204).send();
                        }
                    });
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

router.post('/comment/:id/downvote', (req, res) => {
    const commentId = req.params.id;
    const username = req.body.username;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                throw new Error();
            }
        })
        .then(() => Comments.findById(commentId))
        .then(comment => {
            if (comment) {
                return Comments.findOne({ _id: commentId, "votes.username": username }, { "votes.$": 1 });
            }
            else throw new Error();
        })
        .then(comment => {
            if (comment) {
                comment.votes[0].voteType = false;
                return comment.save()
                    .then(comment => {
                        delete comment.votes;
                        res.status(200).send(comment);
                    });
            } else {
                Comments.findById(commentId)
                    .then(comment => {
                        if (comment) {
                            comment.votes.push({ username: username, voteType: false });
                            return comment.save()
                                .then(comment => {
                                    delete comment.votes;
                                    res.status(200).send(comment);
                                });
                        } else {
                            cont = false;
                            return res.status(204).send();
                        }
                    });
            }
        })
        .catch(error => res.status(400).send({ error: error.message }));
});

module.exports = router;