
/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */
const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const uploadService = require('../services/uploadService');
const service = new uploadService();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage });
router.post('/image', upload.single('image'), (req, res, next) => {

    if(!req.file){
        res.status(400).send({ success: false, data: [], message: "Không tìm thấy hình ảnh" })
    }
    let file_name = req.file.filename;
    service
        .uploadImage(file_name)
        .then((data) => res.send(data))
        .catch((err) =>
            res.status(400).send({ success: false, data: [], message: err.message })
        );
});

module.exports = router;
