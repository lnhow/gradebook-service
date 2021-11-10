const router = require('express').Router();
const { auth } = require('../../utils/aclService');

const inviteService = require('../services/inviteService');
const service = new inviteService();

// Create an invitation
router.post('/', auth, (req, res) => {
    let params = req.body;
    params.user_info = req.user;

    service.create(params)
    .then((data) => res.status(200).send(data))
    .catch(err => {
      switch (err.message) {
        case 'Không có quyền thực hiện hành động này':
          res.status(403);
          break;
        case 'Vui lòng truyền class_id':
        case 'Lớp học không tồn tại':
        default:
          res.status(400);
          break;
      }

      res.send({ 
        success: false,
        data: [], 
        message: err.message 
      });
    });
});

module.exports = router;
