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

//Join an invitation
router.post('/join', auth, (req, res) => {
  let params = req.body;
  params.user_info = req.user;

  service.join(params)
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

router.delete('/:inviteToken', auth, (req, res) => {
  let params = {
    token: req.params.inviteToken,
    user_info: req.user
  }

  service.disable(params)
  .then((data) => res.status(200).send(data))
    .catch(err => {
      switch (err.message) {
        case 'Không có quyền thực hiện hành động này':
          res.status(403);
          break;
        case 'Vui lòng truyền class_id':
        case 'Invite token không hợp lệ':
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
})

module.exports = router;
