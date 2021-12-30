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
            user_type: params.user_type || "C",
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


    async register(params, isOAuth = false) {
        //validate username
        if (this.isEmpty(params.username)) {
            throw new Error("Vui lòng truyền username");
        }

        let [chk_username, chk_username_err] = await this.handle(this.repo.showByCol("username", params.username));
        if (chk_username_err) throw (chk_username_err);

        if (!this.isEmpty(chk_username)) {
            throw new Error("Đã tồn tại username");
        }

        // Validate fullname
        if (this.isEmpty(params.full_name)) {
            throw new Error("Họ và tên là bắt buộc");
        }

        // OAuth does is secure, without password, ignore
        if (!isOAuth) {
            // Validate password
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
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password || '');

        let _params_new_users = {
            username: params.username,
            salt: salt,
            password: passwordHash,
            full_name: params.full_name || params.username,
            user_type: "C",
            avatar: params.avatar || ''
        }

        let [new_user, new_user_err] = await this.handle(this.repo.create(_params_new_users));
        if (new_user_err) throw (new_user_err);

        return {
            id: new_user.insertId,
            ..._params_new_users
        }
    }

    async createAdmin(params) {

        let [details, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(details) || details.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }
        if (details.user_type !== 'A') {
            throw new Error("Tài khoản bạn không đủ thẩm quyền");
        }
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

        let _params_new_users = {
            username: params.username,
            salt: salt,
            password: passwordHash,
            user_type: "A",
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

    async details(params) {

        let [details, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(details) || details.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }
        let {full_name,user_code,date_of_birth,phone,sex,avatar} = details
        return {
            success: true,
            data: {
                full_name,
                user_code,
                date_of_birth,
                phone,
                sex,
                avatar
            },
            message: "Lấy người dùng thành công"
        };
    }
    async update(params)
    {
        let [details, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(details) || details.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }
        let {full_name,user_code,date_of_birth,phone,sex,avatar} = details

        let _params_update = {
            full_name: params.full_name || full_name,
            user_code: params.user_code || user_code,
            date_of_birth: params.date_of_birth || date_of_birth,
            phone: params.phone || phone,
            sex: params.sex || sex,
            avatar: params.avatar || avatar
        }

        let [up_user, up_user_err] = await this.handle(this.repo.update(params.user_info.id, _params_update));
        if (up_user_err) throw (up_user_err);
        
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công"
        }
    }

    async updateUserByAdmin(id,params)
    {
        let [details, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(details)) {
            throw new Error("Không tìm thấy user này");
        }
        if (details.user_type !== 'A') {
            throw new Error("Tài khoản bạn không đủ thẩm quyền");
        }
        console.log(id)
        let [detailsUser, err_detailsUser] = await this.handle(this.repo.show(id));
        if (err_detailsUser) throw (err_detailsUser);
        if (this.isEmpty(details)) {
            throw new Error("Không tìm thấy tài khoản user này để cập nhập thông tin");
        }
        if (!this.isEmpty(params.status) && !["A", "I", "D"].includes(params.status)) {
            throw new Error("Status phải thuộc A,I,D");
        }
        let {full_name,user_code,date_of_birth,phone,sex,avatar,status} = detailsUser
        console.log(detailsUser)
        let _params_update = {
            full_name: params.full_name || full_name,
            user_code: params.user_code || user_code,
            date_of_birth: params.date_of_birth || date_of_birth,
            phone: params.phone || phone,
            sex: params.sex || sex,
            avatar: params.avatar || avatar,
            status: params.status || status
        }

        let [up_user, up_user_err] = await this.handle(this.repo.update(id, _params_update));
        if (up_user_err) throw (up_user_err);
        
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công"
        }
    }
    
    async changePassword(params)
    {
        if (this.isEmpty(params.oldpassword)) {
            throw new Error("Vui lòng truyền oldpassword");
        }
        if (this.isEmpty(params.newpassword)) {
            throw new Error("Vui lòng truyền newpassword");
        }

        let [user, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(user) || user.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }

        let dePasswordHash = helper.desaltHashPassword(params.oldpassword,user.salt);
        if (dePasswordHash !== user.password)
        {
            throw new Error('Mật khẩu cũ không đúng');
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.newpassword);
        let _params_update = {
            password: passwordHash,
            salt: salt
        }
        let [up_user_password, up_user_password_err] = await this.handle(this.repo.update(params.user_info.id,_params_update));
        if (up_user_password_err) throw (up_user_password_err);

        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Đổi mật khẩu thành công"
        }
    }

    async listUser(params)
    {
        
        let [details, err] = await this.handle(this.repo.show(params.user_info.id));
        if (err) throw (err);
        if (this.isEmpty(details) || details.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }
        if (details.user_type !== 'A') {
            throw new Error("Tài khoản bạn không đủ thẩm quyền");
        }
        let [listUser, err_listUser] = await this.handle(this.repo.listByType(params.user_type));
        if (err_listUser) throw (err_listUser)
        return {
            success: true,
            data: {
                listUser
            },
            message: "Lấy danh sách user thành công"
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
