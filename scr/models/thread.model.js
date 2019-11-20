const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = require('./comment.model');
const VoteSchema = require('./vote.schema');

const ThreadSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required!']
    },
    content: {
        type: String,
        required: [true, 'Content is required!']
    },
    username: {
        type: String,
        required: [true, 'User is required!']
    },
    votes: {
        type: [VoteSchema],
        validate: {
            validator: votes => {
                const usernames = [];
                let result = true;
                votes.forEach(vote => {
                    const username = vote.useranme;
                    if (usernames.includes(username)) {
                        result = false;
                        return;
                    } else {
                        usernames.push(username);
                    }
                });
                return result;
            },
            message: 'Duplicate username id in `votes` field!'
        },
        default: []
    }
});

ThreadSchema.virtual('user', {
    ref: 'user',
    localField: 'username',
    foreignField: 'username',
    justOne: true
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;