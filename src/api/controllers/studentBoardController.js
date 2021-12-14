
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const studentBoardService = require('../services/studentBoardService');
const service = new studentBoardService();


module.exports = router;
