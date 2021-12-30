
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { private, auth } = require('../../utils/aclService');
const router = express.Router();
const usersService = require('../services/usersService');
const service = new usersService();

// Register a new user
router.post('/sign-up', (req, res) => {
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

router.post('/admin', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.createAdmin(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Get user
router.get('/owner', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.details(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Update user
router.put('/update', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.update(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Change password
router.post('/change-password', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.changePassword(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Get list user
router.get('/', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.listUser(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Update user by admin
router.put('/update/:id', auth, (req, res) => {
    let params = req.body;
    let id = req.params.id;
    params.user_info = req.user;
    service.updateUserByAdmin(id,params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
