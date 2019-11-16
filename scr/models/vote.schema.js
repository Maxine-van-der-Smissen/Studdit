const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    voteType: {
        type: Boolean,
        default: true
    }
});

module.exports = VoteSchema;