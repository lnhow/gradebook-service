
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const gradeService = require('../services/gradeService');
const service = new gradeService();

router.get('/studentgrade/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.showGradeStudentByClassId(id,params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

router.get('/classgrade/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.showClassGrade(id,params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
