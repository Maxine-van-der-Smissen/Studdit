const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = require('./comment.schema');
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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required!']
    },
    votes: {
        type: [VoteSchema],
        default: []
    },
    comments: {
        type: [CommentSchema],
        default: []
    }
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;