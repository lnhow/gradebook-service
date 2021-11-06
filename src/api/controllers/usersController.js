
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { private } = require('../../utils/aclService');
const router = express.Router();
const usersService = require('../services/usersService');
const service = new usersService();

// Register a new user
router.post('/register', (req, res) => {
    let params = req.body;
    service.register(params)
        .then((data) => res.status(201).send({
            success: true,
            data: data,
            message: "Đăng ký tài khoản thành công"
        }))
        .catch(err => res.status(400).send({ 
            success: false, 
            data: [], 
            message: err.message 
        }));
});

// Create user for admin
router.post('/', private, (req, res) => {
    let params = req.body;
    service.create(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
