const express = require('express');
const router = express.Router();

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://hobby-npbnlebfkikggbkepkdfkddl.dbs.graphenedb.com:24787", neo4j.auth.basic("dilivio", "b.x18kQlQ3Hq5Z.qzUPTD4X35ePsosx"));

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
        .catch(error => res.status(401).send({ error: error }));
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

router.post('/friends', (req, res) => {
    const { befriender, befriended } = req.body;
    const session = driver.session();

    res.status(202).send();
    User.find({ $or: [{ username: befriender }, { username: befriended }] })
        .then(users => {
            if (users.length !== 2) throw new Error();

            return session.run(`
                MERGE (befriender:User {username:"${befriender}"})
                MERGE (befriended:User {username:"${befriended}"})
                MERGE (befriender)-[:FRIENDS_WITH]->(befriended)
            `);
        })
        .then(() => console.log('Relation was made!'))
        .catch(console.log);

    session.close();
});

router.delete('/friends/:befriender', (req, res) => {
    const befriender = req.params.befriender;
    const befriended = req.body.befriended;
    const session = driver.session();

    res.status(202).send();
    User.find({ $or: [{ username: befriender }, { username: befriended }] })
        .then(users => {
            if (users.length !== 2) throw new Error();

            return session.run(`
                MATCH (:User {username:"${befriender}"})-[friendship:FRIENDS_WITH]->(:User {username:"${befriended}"})
                DELETE friendship
            `);
        })
        .then(() => console.log('Relation was destroyed!'))
        .catch(console.log);

    session.close();
});

module.exports = router;