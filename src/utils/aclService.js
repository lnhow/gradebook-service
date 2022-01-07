/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */

const config = require("config");
const sessionService = require('../api/services/sessionService');
const service = new sessionService();

const passport = require('passport');

async function auth(req, res, next) {
  let route = req.baseUrl;
  let controller = route.replace('/v1/', '');
  // let method = req.method;

  const errResponse = {
    success: false,
    message: 'Bạn không có quyền truy cập. Nếu đã đăng nhập, vui lòng đăng nhập lại',
    data: [],
  }

  passport.authenticate('token', (err, user, info) => {
    if (err) {
      const resData = errResponse;
      resData.message = err.message;
      return res.status(403).json(resData);
    }
    if (!user) {
      return res.status(403).json(errResponse);
    }

    req.user = user;
    next();
  })(req, res, next);
}

// Old auth middleware
// async function auth(req, res, next) {
//   let route = req.baseUrl;
//   let controller = route.replace('/v1/', '');
//   let method = req.method;

//   let headers = req.headers;

//   if (!headers.authorization) {
//     return res.status(403).json({
//       success: false,
//       message: 'Thiếu token truy cập',
//     });
//   }

//   let token = headers.authorization;

//   // Get user info by token from session db
//   let _user = {};
//   await service.getUserinfo(token).then((data) => _user = data.data).
//     catch(err => res.status(400).send({ success: false, data: [], message: err.message }));
//   req.user = _user
//   if (_user && (_user.token === token)) {
//     next();
//   } else {
//     return res.status(403).send({
//       success: false,
//       message: 'Bạn không có quyền truy cập ứng dụng này. Nếu đã đăng nhập, vui lòng đăng nhập lại',
//       data: [],
//     });
//   }
// }

async function private(req, res, next) {
  const { method, headers } = req;
  const { secret_key } = config.get("api");

  if (!headers.authorization) {
    return res
      .status(403)
      .json({ success: false, data: [], message: "No authorization token" });
  }

  const token = headers.authorization;

  if (secret_key !== token) {
    return res
      .status(403)
      .json({
        success: false,
        data: [],
        message: "Do not have permission to access this application",
      });
  }

  next();
}

module.exports = {
  auth,
  private,
};
