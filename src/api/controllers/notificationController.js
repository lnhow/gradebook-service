const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const notificationService = require('../services/notificationService');
const service = new notificationService();

router.put('/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.update(id, params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

router.put('/', auth, (req, res) => {
    let params = {};
    params.user_info = req.user;
    service.readAll(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

router.get('/', auth, (req, res) => {
    let params = req.query;
    params.user_info = req.user;
    service.list(params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});

module.exports = router;
