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
    }
});

CommentSchema.virtual('user', {
    ref: 'user',
    localField: 'username',
    foreignField: 'username',
    justOne: true
});

CommentSchema.add({
    comments: {
        type: [CommentSchema],
        validate: {
            validator: comments => {
                const ids = [];
                let result = true;
                comments.forEach(comment => {
                    const id = comment._id.toString();
                    if (ids.includes(id)) {
                        result = false;
                        return;
                    } else {
                        ids.push(id);
                    }
                });
                return result;
            },
            message: 'Duplicate comment id in `comments` field!'
        },
        default: []
    }
});

module.exports = CommentSchema;