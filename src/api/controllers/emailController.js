
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const emailService = require('../services/emailService');
const service = new emailService();

// Get all
router.post('/', auth, (req, res) => {
    let params = req.body;
    service.sendEmail(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
