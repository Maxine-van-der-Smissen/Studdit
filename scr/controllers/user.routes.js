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

//Edit an existing user
router.put('/:name', (req, res) => {
    const userName = req.params.name;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const userProps = { username: userName, password: newPassword };

    User.findOneAndUpdate({ username: userName, password: password, active: true }, { password: newPassword }, updateRemoveSettings)
        .then(() => User.findOne(userProps))
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(error => res.status(401).send({ error: 'Username and password didn\'t match!' }));
});

//Delete a user
router.delete('/:username', (req, res) => {
    const userName = req.params.username;
    const userPassword = req.body.password;

    const userProps = { username: userName, password: userPassword, active: true };

    User.findOneAndUpdate(userProps, { active: false }, updateRemoveSettings)
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(error => res.status(401).send({ error: 'Username and password didn\'t match!' }));
});

module.exports = router;