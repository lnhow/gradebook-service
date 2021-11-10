const router = require('express').Router();
const { auth } = require('../../utils/aclService');

const inviteService = require('../services/inviteService');
const service = new inviteService();

// Create an invitation
router.post('/', auth, (req, res) => {
    let params = req.body;

    service.create(params)
    .then((data) => res.status(200).send(data))
    .catch(err => res.status(400).send({ 
      success: false,
      data: [], 
      message: err.message 
    }));
});

module.exports = router;
