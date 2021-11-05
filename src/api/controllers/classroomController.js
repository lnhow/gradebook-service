
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { private, auth } = require('../../utils/aclService');
const router = express.Router();
const classroomService = require('../services/classroomService');
const service = new classroomService();

// Get all
router.get('/', auth, (req, res) => {
    let params = req.query;
    params.user_info = req.user;
    service.list(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

router.post('/', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.create(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

router.put('/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.update(id, params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
