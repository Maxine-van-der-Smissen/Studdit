const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = require('./vote.schema');

const CommentSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Content is required!']
    },
    username: {
        type: String,
        required: [true, 'User is required!']
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'thread',
        required: [true, 'Thread is required!']
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'comment, thread',
        required: [true, 'Parent is required!']
    },
    votes: {
        type: [VoteSchema],
            validator: votes => {
                const usernames = [];
                votes.forEach(vote => {
                    if (usernames.includes(username)) {
                        return;
                    } else {
                        usernames.push(username);
                    }
                });
            },
            message: 'Duplicate username id in `votes` field!'
        },
        default: []
    }
});

CommentSchema.virtual('user', {
    ref: 'user',
    localField: 'username',
    foreignField: 'username',
    justOne: true
});

CommentSchema.virtual('upvotes').get(function() {
    let upvotes = 0;
    this.votes.forEach(vote => {
        if(vote.voteType) upvotes++;
    });

    return upvotes;
});

CommentSchema.virtual('downvotes').get(function() {
    let downvotes = 0;
    this.votes.forEach(vote => {
    });

    return downvotes;
});

CommentSchema.virtual('amountVotes').get(function() {
    let votes = 0;
    this.votes.forEach(vote => {
        if(vote.voteType){
            votes++
        }else{
            votes--;
    }});

    return votes;
});


const Comments = mongoose.model('comment', CommentSchema);

module.exports = Comments;