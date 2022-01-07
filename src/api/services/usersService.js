const moment = require('moment');

const usersRepository = require("../repositories/usersRepository");
const usersCollections = require("../collections/usersCollections");
const EmailService = require('../services/emailService');

const helper = require("../../utils/helper");
const { account_ot_code_length, gen_max_retry_account_ot_code } = require('../../utils/constant');
const { genForgotPasswordLink, genActivationLink } = require('../../utils/clientLink.helper');

class usersService {
    constructor() {
        this.repo = new usersRepository();
        this.col = new usersCollections();
        this.email_service = new EmailService();
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
            throw new Error("Đã tồn tại tài khoản");
        }

        // Validate fullname
        if (this.isEmpty(params.full_name)) {
            throw new Error("Họ và tên là bắt buộc");
        }

        let extra_info = {};
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

            // Generate one time used code
            let [ot_code, err_ot_code] = await this.handle(this.genOneTimeCode());
            if (err_ot_code) throw (err_ot_code);

            // Send email
            let params_invite_email = {
                type: 2,
                email: params.username,
                content: {
                    activation_link: genActivationLink(ot_code)
                }
            }
            let [send_email, send_email_err] = await this.handle(this.email_service.sendEmail(params_invite_email));
            if (send_email_err) throw (send_email_err);

            extra_info = {
                ot_code: ot_code,
                status: 'I',    // Inactive by default
            }
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password || '');

        let _params_new_users = {
            username: params.username,
            salt: salt,
            password: passwordHash,
            full_name: params.full_name || params.username,
            user_type: "C",
            avatar: params.avatar || '',
            ...extra_info,
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

    async adminGetUser(id, params) {
        if (params.user_info.user_type !== 'A') { 
            throw new Error("Tài khoản bạn không đủ thẩm quyền");
        }

        let [details, err] = await this.handle(this.repo.show(id));
        if (err) throw (err);
        if (this.isEmpty(details)) {
            throw new Error("Không tìm thấy user này");
        }

        let {
            full_name,user_code,date_of_birth,
            phone,sex,avatar, username,
            status
        } = details
        return {
            success: true,
            data: {
                id,
                username,
                full_name,
                user_code,
                date_of_birth,
                phone,
                sex,
                avatar,
                status
            },
            message: "Lấy người dùng thành công"
        };
    }

    async adminResetPassword(id, params) {
        if (params.user_info.user_type !== 'A') { 
            throw new Error("Tài khoản bạn không đủ thẩm quyền");
        }

        if (this.isEmpty(params.password)) {
            throw new Error("Vui lòng truyền password");
        }

        let [user, err] = await this.handle(this.repo.show(id));
        if (err) throw (err);
        if (this.isEmpty(user) || user.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password);
        let _params_update = {
            password: passwordHash,
            salt: salt
        }
        let [up_user_password, up_user_password_err] = await this.handle(this.repo.update(id,_params_update));
        if (up_user_password_err) throw (up_user_password_err);

        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Đổi mật khẩu thành công"
        }
    }

    async genOneTimeCode(retry = 0) {
        if (retry >= gen_max_retry_account_ot_code) {
            throw new Error('Không tạo được mã dùng một lần');
        }
        const ot_code = helper.genRandomString(account_ot_code_length);
        let [user, err_user] = await this.handle(this.repo.showByOneTimeCode(ot_code));
        if (err_user) {
            throw err_user;
        }

        if (this.isEmpty(user)) {
            return ot_code;
        }
        return this.genOneTimeCode(retry + 1);
    }

    async handleForgotPassword(params, user_type = 'C') {
        if (this.isEmpty(params.email)) {
            throw new Error('Vui lòng truyền email');
        }

        // Check user exist
        let [user, err_user] = await this.handle(this.repo.showByCol("username", params.email));
        if (err_user) throw (err_user);

        if (this.isEmpty(user) || user.status === 'D' || user.user_type !== user_type) {
            throw new Error("Không tồn tại người dùng với email này");
        }

        // Block weird cases
        if (user.status === 'I') {
            throw new Error('Tài khoản chưa được kích hoạt');
        }

        const userId = user.id;

        // Generate one time used code
        let [ot_code, err_ot_code] = await this.handle(this.genOneTimeCode());
        if (err_ot_code) throw (err_ot_code);

        let _params_update = {
            ot_code: ot_code
        }

        let [up_user, up_user_err] = await this.handle(this.repo.update(userId, _params_update));
        if (up_user_err) throw (up_user_err);

        // Send email
        let params_invite_email = {
            type: 3,
            email: params.email,
            content: {
                reset_link: genForgotPasswordLink(ot_code)
            }
        }
        let [send_email, send_email_err] = await this.handle(this.email_service.sendEmail(params_invite_email));
        if (send_email_err) throw (send_email_err);

        return {
            success: true,
            data: [],
            message: "Yêu cầu reset password thành công"
        }
    }

    async verifyOneTimeToken(params) {
        if (this.isEmpty(params.ot_code)) {
            throw new Error('Không có mã một lần');
        }
        
        let [user, err_user] = await this.handle(this.repo.showByOneTimeCode(params.ot_code));
        if (err_user) throw (err_user);
        if (this.isEmpty(user) || user.status === 'D' || user.user_type !== 'C') {
            throw new Error("Mã không hợp lệ");
        }

        return {
            success: true,
            data: [],
            message: 'Mã một lần hợp lệ'
        }
    }

    async handlePasswordReset(params, user_type = 'C') {
        if (this.isEmpty(params.ot_code)) {
            throw new Error('Không có mã reset');
        }
        if (this.isEmpty(params.password)) {
            throw new Error('Không có mật khẩu mới');
        }

        if (!params.password.match(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
        )) {
            throw new Error(
                'Mật khẩu tối thiểu 8 ký tự, ít nhất một ký tự viết hoa'
                + ', một ký tự viết thường, một số và một ký tự đặc biệt(#?!@$%^&*-)'
            );
        }

        let [user, err_user] = await this.handle(this.repo.showByOneTimeCode(params.ot_code));
        if (err_user) throw (err_user);

        if (this.isEmpty(user) || user.status === 'D' || user.user_type !== user_type) {
            throw new Error("Mã reset không hợp lệ");
        }

        // Block weird cases
        if (user.status === 'I') {
            throw new Error('Tài khoản chưa được kích hoạt');
        }

        const { salt, passwordHash } = helper.saltHashPassword(params.password);
        let _params_update = {
            ot_code: null,  // Consume one time code
            password: passwordHash,
            salt: salt
        }

        const userId = user.id
        let [user_updated, err_user_updated] = await this.handle(this.repo.update(userId,_params_update));
        if (err_user_updated) throw (err_user_updated);
        
        return {
            success: true,
            data: [],
            message: 'Reset mật khẩu thành công'
        }
    }

    async handleActivateAccount(params, user_type = 'C') {
        if (this.isEmpty(params.ot_code)) {
            throw new Error('Không có mã kích hoạt');
        }

        let [user, err_user] = await this.handle(this.repo.showByOneTimeCode(params.ot_code));
        if (err_user) throw (err_user);

        if (this.isEmpty(user) || user.status === 'D' || user.user_type !== user_type) {
            throw new Error(`Mã kích hoạt không hợp lệ (${params.ot_code})`);
        }

        // Block weird cases
        if (user.status !== 'I') {
            throw new Error('Tài khoản đã được kích hoạt trước đó');
        }

        let _params_update = {
            ot_code: null,  // Consume one time code
            status: 'A',
        }

        const userId = user.id
        let [user_updated, err_user_updated] = await this.handle(this.repo.update(userId,_params_update));
        if (err_user_updated) throw (err_user_updated);
        
        return {
            success: true,
            data: [],
            message: 'Kích hoạt tài khoản thành công'
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
