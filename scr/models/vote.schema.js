const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required!']
    },
    voteType: {
        type: Boolean,
        default: true
    }
});

module.exports = VoteSchema;