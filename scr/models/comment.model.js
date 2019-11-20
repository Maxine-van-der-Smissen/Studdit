const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = require('./vote.schema');

const CommentSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Id is required!']
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
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'thread'
    }

});

CommentSchema.virtual('user', {
    ref: 'user',
    localField: 'username',
    foreignField: 'username',
    justOne: true
});

CommentSchema.add({
    parentComment:{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }
});

const Comments = mongoose.model('comment', CommentSchema);

module.exports = Comments;