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

    //invite
    const inviteCtrl = require('./api/controllers/inviteController');
    app.use(`${version}/invite`, inviteCtrl);

    //assignment
    const assignmentCtrl = require('./api/controllers/assignmentController');
    app.use(`${version}/assignment`, assignmentCtrl);

    //grades
    const gradeCtrl = require('./api/controllers/gradeController');
    app.use(`${version}/grade`, gradeCtrl);

    //grade_review
    const gradeReviewCtrl = require('./api/controllers/gradeReviewController');
    app.use(`${version}/gradereview`, gradeReviewCtrl);

    //comment
    const gradeCommentCtrl = require('./api/controllers/gradeCommentController');
    app.use(`${version}/gradecomment`, gradeCommentCtrl);

    //notification
    const notificationCtrl = require('./api/controllers/notificationController');
    app.use(`${version}/notification`, notificationCtrl);

    //media
    const mediaCtrl = require('./api/controllers/mediaController');
    app.use(`${version}/media`, mediaCtrl);
}
