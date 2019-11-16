const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = require('./vote.schema');

const CommentSchema = new Schema({
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

module.exports = CommentSchema;