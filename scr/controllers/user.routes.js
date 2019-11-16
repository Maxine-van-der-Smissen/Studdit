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
        .catch(error => res.status(400).send({ error: error.errmsg }));
});

//Edit an existing user
router.put('/:name', (req, res) => {
    const username = req.params.name;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const userProps = { username, newPassword };

    User.findOneAndUpdate({ username: username, password: password, active: true }, userProps, updateRemoveSettings)
        .then(() => User.findById(userId))
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(error => res.status(401).send({ error: error }));
});

//Delete a user
router.delete('/:username', (req, res) => {
    const username = req.params.username;
    const password = req.body;

    User.findOneAndUpdate({ username: username, password: password, active: true }, { active: false }, updateRemoveSettings)
        .then(({ username, password, active }) => res.status(200).send({ username }))
        .catch(error => res.status(401).send({ error: error }));
});

module.exports = router;