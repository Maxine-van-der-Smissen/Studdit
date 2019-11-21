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
                let valid = true;
                votes.forEach(vote => {
                    const username = vote.username;
                    if (usernames.includes(username)) {
                        valid = false;
                        return;
                    } else {
                        usernames.push(username);
                    }
                });
                return valid;
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

ThreadSchema.virtual('upvotes').get(function() {
    let upvotes = 0;
    this.votes.forEach(vote => {
        if(vote.voteType) upvotes++;
    });

    return upvotes;
});

ThreadSchema.virtual('downvotes').get(function() {
    let downvotes = 0;
    this.votes.forEach(vote => {
        if(!vote.voteType) downvotes++;
    });

    return downvotes;
});

ThreadSchema.virtual('amountVotes').get(function() {
    let votes = 0;
    this.votes.forEach(vote => {
        if(vote.voteType){
            votes++
        }else{
            votes--;
    }});

    return votes;
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;