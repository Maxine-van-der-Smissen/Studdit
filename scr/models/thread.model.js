const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = require('./comment.schema');
const VoteSchema = require('./vote.schema');

const ThreadSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
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