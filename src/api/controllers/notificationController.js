const express = require('express');
const { auth } = require('../../utils/aclService');
const router = express.Router();
const notificationService = require('../services/notificationService');
const service = new notificationService();

router.put('/:id', auth, (req, res) => {
    let id = req.params.id;
    let params = req.body;
    params.user_info = req.user;
    service.update(id,params).then((data) => res.status(200).send(data)).
        catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
});


module.exports = router;
