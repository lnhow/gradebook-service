const helper = require('../../utils/helper');
const usersRepository = require('../repositories/usersRepository');
const sessionRepository = require('../repositories/sessionRepository');
const { auth_token_length } = require("../../utils/constant");

const { genPasswrd } = require('../../utils/helper');

// Sign in with google
const GOOGLE_OAUTH_CLIENT_ID = require('../../../config/default').oAuthClientID.google;
const { OAuth2Client } = require('google-auth-library');
const usersService = require('../services/usersService');
const userServiceObj = new usersService();

class AuthService {
    constructor() {
        this.user_repo = new usersRepository();
        this.session_repo = new sessionRepository();
    }

    async signIn(params) {
        let user_type
        if (this.isEmpty(params.username)) {
            throw new Error('Vui lòng truyền username');
        }

        if (this.isEmpty(params.password)) {
            throw new Error('Vui lòng truyền password');
        }
        if (this.isEmpty(params.user_type)) {
            user_type = "C"
        }
        else user_type = params.user_type
        let [user, user_err] = await this.handle(this.user_repo.showByKey(params.username,user_type));
        if (user_err) throw (user_err);
        if (this.isEmpty(user)) {
            throw new Error('Tài khoản không tồn tại');
        }

        // Check active user
        if (user.status === 'I') {
            throw new Error('Tải khoản chưa được kích hoạt');
        }
        if (user.status === 'D') {
            throw new Error('Tải khoản bạn đã bị khóa');
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

    // Use google email as username
    async handleGoogleSignIn(params) {
        const client = new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID);

        if (this.isEmpty(params.token)) {
            throw new Error('Không có token google');
        }

        let [ticket, ticket_err] = await this.handle(client.verifyIdToken({
            idToken: params.token,
            audience: GOOGLE_OAUTH_CLIENT_ID
        }));

        if (ticket_err) {
            throw new Error('Token google không hợp lệ');
        }
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let [user, user_err] = await this.handle(this.user_repo.showByCol('username', email));
        if (user_err) {
            throw(user_err);
        };

        if (this.isEmpty(user)) {
            // Account does not exist -> register new user
            const password = genPasswrd();  //Require no password, gennerate 1
            const newUser = {
                username: email,
                full_name: name,
                avatar: picture,
                password,
            };

            [user, user_err] = await this.handle(
                userServiceObj.register(newUser, true)
            );
            if (user_err) throw(user_err);

            // Re-fetch newly created user
            [user, user_err] = await this.handle(this.user_repo.showByCol('username', email));
            if (user_err) throw(user_err);
        }

        // Check active user
        if (user.status !== 'A') {
            throw new Error('Tải khoản chưa được kích hoạt');
        }

        // Update last login
        let [up_last_login, up_last_login_err] = await this.handle(this.user_repo.update(user.id, { last_login_at: new Date() }));
        if (up_last_login_err) throw (up_last_login_err);

        // Remove old session
        let [remove_token, remove_token_err] = await this.handle(this.session_repo.removeToken(user.id));
        if (remove_token_err) throw (remove_token_err);

        // Create new session
        let token = helper.genRandomString(auth_token_length);
        let [new_session, new_session_err] = await this.handle(this.session_repo.create({
            user_id: user.id,
            token
        }));
        if (new_session_err) throw (new_session_err);

        return {
            token,
            user_info: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                user_type: user.user_type,
                avatar: user.avatar
            }
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
