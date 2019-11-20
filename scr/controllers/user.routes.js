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
router.put('/:username', (req, res) => {
    const username = req.params.username;
    const { password, newPassword } = req.body;

    User.findOne({ username: username, active: true })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    return user.updateOne({ password: newPassword })
                    .then(() => res.status(200).send({ username: user.username }))
                }
                else {
                    res.status(401).send({ error: 'Username and password didn\'t match!' });
                }
            }
            else {
                res.status(204).send();
            }
        })
        .catch (error => res.status(401).send({ error: error }));
});

//Delete a user by setting the active flag to false
router.delete('/:username', (req, res) => {
    const username = req.params.username;
    const password = req.body.password;

    User.findOne({ username: username, active: true })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    user.active = false;
                    user.save()
                        .then(() => res.status(200).send({ username: user.username }));
                }
                else {
                    res.status(401).send({ error: 'Username and password didn\'t match!' });
                }
            }
            else {
                res.status(204).send();
            }
        })
        .catch(error => res.status(401).send({ error: error }));
});

module.exports = router;