const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
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

UserSchema.plugin(uniqueValidator);

const User = mongoose.model('user', UserSchema);

module.exports = User;