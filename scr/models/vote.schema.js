const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    username: {
        type: String,
        required: [true, 'User is required!']
    },
    voteType: {
        type: Boolean,
        default: true
    }
});

VoteSchema.virtual('user', {
    ref: 'user',
    localField: 'username',
    foreignField: 'username',
    justOne: true
});

module.exports = VoteSchema;