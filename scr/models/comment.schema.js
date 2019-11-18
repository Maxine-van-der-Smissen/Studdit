const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = require('./vote.schema');

const CommentSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Id is required!'],
        unique: [true, 'Id must be unique!']
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
        default: []
    }
});

module.exports = CommentSchema;