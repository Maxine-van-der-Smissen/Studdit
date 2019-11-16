const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

UserSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model('user', UserSchema);

module.exports = User;