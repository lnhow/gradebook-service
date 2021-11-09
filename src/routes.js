/*
 * Copyright (c) Nhat Tin 2019. All Rights Reserved.
 * @author khoa.nt
 */


module.exports = function (app, version) {

    //authenticate
    const authCtrl = require('./api/controllers/authController');
    app.use(`${version}/auth`, authCtrl);

    //users
    const userCtrl = require('./api/controllers/usersController');
    app.use(`${version}/users`, userCtrl);

    //classrooms
    const clsrmCtrl = require('./api/controllers/classroomController');
    app.use(`${version}/classrooms`, clsrmCtrl);

    //email
    const emailCtrl = require('./api/controllers/emailController');
    app.use(`${version}/send-email`, emailCtrl);

    //uploads
    const uploadCtrl = require('./api/controllers/uploadController');
    app.use(`${version}/upload`, uploadCtrl);
}
