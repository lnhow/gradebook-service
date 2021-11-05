
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { private, auth } = require('../../utils/aclService');
const router = express.Router();
const authService = require('../services/authService');
const service = new authService();

//Sign in
router.post('/sign-in', (req, res) => {
    let params = req.body;
    service.signIn(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Sign out
router.post('/sign-out', auth, (req, res) => {
    let params = req.user;
    service.signOut(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
