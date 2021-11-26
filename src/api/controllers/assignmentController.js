
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const assignmentService = require('../services/assignmentService');
const service = new assignmentService();

// Create new assignment
router.post('/', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.create(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Arrange list assignment
router.put('/arrange', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;
    service.arrange(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});


//Update assignment
router.put('/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.update(id, params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

//Delete assignment
router.delete('/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    params.status = 'D';
    service.update(id, params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});


module.exports = router;
