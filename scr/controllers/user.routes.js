const express = require('express');
const router = express.Router();

const User = require('../models/user.model');

//Deprication safe settings for removing or updating using the model
const updateRemoveSettings = { useFindAndModify: false };

//Create new user
router.post('/', (req, res) => {
    const userProps = req.body;

    User.create(userProps)
        .then(({ username, password, active }) => res.status(201).send({ username }))
        .catch(error => res.status(400).send({ error: error.message }));
});

//Change the password of an existing user
router.put('/', (req, res) => {
    const { username, password, newPassword } = req.body;
    const userProps = { username: username, password: newPassword };

    User.findOneAndUpdate({ username: username, password: password, active: true }, { password: newPassword }, updateRemoveSettings)
        .then(() => User.findOne(userProps))
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(() => res.status(401).send({ error: 'Username and password didn\'t match!' }));
});

//Delete a user by setting the active flag to false
router.delete('/', (req, res) => {
    const { username, password } = req.body;

    const userProps = { username: username, password: password, active: true };

    User.findOneAndUpdate(userProps, { active: false }, updateRemoveSettings)
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(() => res.status(401).send({ error: 'Username and password didn\'t match!' }));
});

module.exports = router;