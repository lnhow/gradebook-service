/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt
 */

const helper = require('../../utils/helper');
const usersRepository = require('../repositories/usersRepository');
const sessionRepository = require('../repositories/sessionRepository');
const { auth_token_length } = require("../../utils/constant")
class AuthService {
    constructor() {
        this.user_repo = new usersRepository();
        this.session_repo = new sessionRepository();
    }

    async signIn(params) {

        if (this.isEmpty(params.username)) {
            throw new Error('Vui lòng truyền username');
        }

        if (this.isEmpty(params.password)) {
            throw new Error('Vui lòng truyền password');
        }

        let [user, user_err] = await this.handle(this.user_repo.showByCol("username", params.username));
        if (user_err) throw (user_err);

        if (this.isEmpty(user)) {
            throw new Error('Tài khoản không tồn tại');
        }

        // Check active user
        if (user.status !== 'A') {
            throw new Error('Tải khoản chưa được kích hoạt');
        }

        // Check match password
        let dePasswordHash = helper.desaltHashPassword(params.password, user.salt);
        if (dePasswordHash !== user.password) {
            throw new Error('Mật khẩu không đúng');
        }

        // Update last login
        let [up_last_login, up_last_login_err] = await this.handle(this.user_repo.update(user.id, { last_login_at: new Date() }));
        if (up_last_login_err) throw (up_last_login_err);

        //Xóa session cũ
        let [remove_token, remove_token_err] = await this.handle(this.session_repo.removeToken(user.id));
        if (remove_token_err) throw (remove_token_err);

        //Tạo session mới
        let token = helper.genRandomString(auth_token_length);
        let [new_session, new_session_err] = await this.handle(this.session_repo.create({
            user_id: user.id,
            token
        }));
        if (new_session_err) throw (new_session_err);

        return {
            success: true,
            data: {
                token,
                user_info: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    user_type: user.user_type,
                    avatar: user.avatar
                }
            },
            message: 'Đăng nhập thành công'
        };
    }

    async signOut(params) {
        let [remove_token, remove_token_err] = await this.handle(this.session_repo.removeToken(params.id));
        if (remove_token_err) throw (remove_token_err);

        return {
            success: true,
            data: [],
            message: 'Đăng xuất thành công'
        };
    }

    isEmpty(value) {
        return [null, undefined, ""].includes(value);
    }

    handle(promise) {
        return promise
            .then(data => ([data, undefined]))
            .catch(error => Promise.resolve([undefined, error]))
    }
}

module.exports = AuthService;
