const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: [true, 'A username must be unique!' ],
        required: [true, 'Username is required!']
    },
    password: {
        type: String,
        required: [true, 'Password is required!']
    },
    active: {
        type: Boolean,
        default: true
    }
});

UserSchema.index({ username: 1 });

const User = mongoose.model('user', UserSchema);

module.exports = User;