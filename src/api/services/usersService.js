/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt@nogistics.vn
 */

const moment = require('moment');

const usersRepository = require("../repositories/usersRepository");
const usersCollections = require("../collections/usersCollections");
const helper = require("../../utils/helper");
class usersService {
    constructor() {
        this.repo = new usersRepository();
        this.col = new usersCollections();
    }

    async create(params) {


        //validate username
        if (this.isEmpty(params.username)) {
            throw new Error("Vui lòng truyền username");
        }

        let [chk_username, chk_username_err] = await this.handle(this.repo.showByCol("username", params.username));
        if (chk_username_err) throw (chk_username_err);

        if (!this.isEmpty(chk_username)) {
            throw new Error("Đã tồn tại username");
        }

        //validate password
        if (this.isEmpty(params.password)) {
            throw new Error("Vui lòng truyền password");
        }

        if (
            !params.password.match(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
            )
        ) {
            throw new Error(
                "Mật khẩu tối thiểu 8 ký tự, ít nhất một ký tự viết hoa, một ký tự viết thường, một số và một ký tự đặc biệt"
            );
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password);

        if (!this.isEmpty(params.user_type) && ["A", "S", "T"].includes(params.user_type)) {
            throw new Error("user_type phải thuộc A,I,S");
        }
        let _params_new_users = {
            username: params.username,
            salt: salt,
            password: passwordHash,
            full_name: params.full_name || params.username,
            user_type: params.user_type || "S",
        }

        let [new_user, new_user_err] = await this.handle(this.repo.create(_params_new_users));
        if (new_user_err) throw (new_user_err);

        return {
            success: true,
            data: {
                id: new_user.insertId,
                ..._params_new_users
            },
            message: "Tạo tài khoản thành công"
        }
    }


    async register(params) {


        //validate username
        if (this.isEmpty(params.username)) {
            throw new Error("Vui lòng truyền username");
        }

        let [chk_username, chk_username_err] = await this.handle(this.repo.showByCol("username", params.username));
        if (chk_username_err) throw (chk_username_err);

        if (!this.isEmpty(chk_username)) {
            throw new Error("Đã tồn tại username");
        }

        //validate password
        if (this.isEmpty(params.password)) {
            throw new Error("Vui lòng truyền password");
        }

        //validate fullname
        if (this.isEmpty(params.password)) {
            throw new Error("Họ và tên là bắt buộc");
        }

        if (
            !params.password.match(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
            )
        ) {
            throw new Error(
                "Mật khẩu tối thiểu 8 ký tự, ít nhất một ký tự viết hoa, một ký tự viết thường, một số và một ký tự đặc biệt"
            );
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password);

        let _params_new_users = {
            username: params.username,
            salt: salt,
            password: passwordHash,
            full_name: params.full_name || params.username,
            user_type: "S",
        }

        let [new_user, new_user_err] = await this.handle(this.repo.create(_params_new_users));
        if (new_user_err) throw (new_user_err);

        return {
            success: true,
            data: {
                id: new_user.insertId,
                ..._params_new_users
            },
            message: "Đăng ký tài khoản thành công"
        }
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

module.exports = usersService;
