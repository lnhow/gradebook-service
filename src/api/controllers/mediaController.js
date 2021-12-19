const express = require("express");
const router = express.Router();

const mediaService = require("../services/mediaService");
const service = new mediaService();

const { auth } = require('../../utils/aclService');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/file_excel')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
});
var upload = multer({ storage: storage });


router.post('/import-grades', auth, upload.single('file'), (req, res, next) => {

    let params = req.query;
    params.file_name = req.file.filename;
    params.user_info = req.user;
    service
        .importGrades(params)
        .then((data) => res.send(data))
        .catch((err) =>
            res.status(400).send({ success: false, data: [], message: err.message })
        );
});

router.post('/import-students', auth, upload.single('file'), (req, res, next) => {

    let params = req.query;
    params.file_name = req.file.filename;
    params.user_info = req.user;
    service
        .importStudents(params)
        .then((data) => res.send(data))
        .catch((err) =>
            res.status(400).send({ success: false, data: [], message: err.message })
        );
});

router.get('/export-classgrade/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;

    service
        .exportGrades(id, params)
        .then((data) => res.download(data.url))
        .catch((err) =>
            res.status(400).send({ success: false, data: [], message: err.message })
        );
});

router.get('/export-template-grades', auth, (req, res) => {
    let params = req.query;
    params.user_info = req.user;

    service
        .exportTemplateGrades(params)
        .then((data) => {
            if (data.url) {
                res.download(data.url);
            } else {
                res.status(200).send({ success: false, data: [], message: data.message })
            }
        })
        .catch((err) =>
            res.status(400).send({ success: false, data: [], message: err.message })
        );
});

router.get('/download', auth, (req, res) => {
    const params = req.query;
    res.download(params.file);
});

module.exports = router;
