const classroomRepository = require("../repositories/classroomRepository");
const userclassRepository = require("../repositories/userclassRepository");
const usersRepository = require("../repositories/usersRepository");
const classroomCollection = require("../collections/classroomCollection");
const invitationRepository = require('../repositories/invitationRepository');

const helper = require("../../utils/helper");
const { class_code_token_length } = require("../../utils/constant")

class classroomService {
    constructor() {
        this.repo = new classroomRepository();
        this.col = new classroomCollection();

        this.repo_user = new usersRepository();

        this.repo_user_class = new userclassRepository();

        this.repo_invite = new invitationRepository();
    }

    async list(params) {
        let is_limit = true;

        // Set Paging
        if (!this.isEmpty(params.page) && !this.isEmpty(params.limit)) {
            this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
        } else {
            is_limit = false;
        }

        this.col.join('tbl_users t2', "t.owner_id", "t2.id", "");
        this.col.addSelect([
            "t.*",
            "t2.full_name as owner_name",
            "t2.avatar as owner_avatar"
        ]);
        this.col.filters(params);
        this.col.addSort('t.created_at', 'DESC');
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);

        let [data, error] = await this.handle(this.repo.list(sql));
        if (error) throw (error);

        let [total, err] = await this.handle(this.repo.listCount(count));
        if (err) throw (err);

        return {
            success: true,
            data,
            total: total.total,
            message: "Lấy danh sách thành công"
        }
    }

    async create(params) {
        if (this.isEmpty(params.class_name)) {
            throw new Error("Vui lòng truyền class_name");
        }

        /////CREATE CLASSROOM/////
        let _params_new_classroom = {
            owner_id: params.user_info.id,
            class_name: params.class_name,
            class_code: helper.genRandomString(class_code_token_length),
            subject: params.subject || "",
            description: params.description || ""
        }

        let [new_class, new_class_err] = await this.handle(this.repo.create(_params_new_classroom));
        if (new_class_err) throw (new_class_err);
        /////////////////////////

        ////CREATE USER-CLASS////
        let _params_user_class = {
            user_id: params.user_info.id,
            class_id: new_class.insertId,
            role: 'T',  //The class creator is a teacher by default
        }

        let [new_user_class, new_user_class_err] = await this.handle(this.repo_user_class.create(_params_user_class));
        if (new_user_class_err) throw (new_user_class_err);
        /////////////////////////

        return {
            success: true,
            data: {
                id: new_class.insertId,
                ..._params_new_classroom
            },
            message: "Tạo lớp thành công"
        }
    }

    async update(id, params) {

        let [details, details_err] = await this.handle(this.repo.show(id));
        if (details_err) throw (details_err);
        if (this.isEmpty(details)) {
            throw new Error("Không tìm thấy lớp học này");
        }

        if (params.user_info.id !== details.owner_id) {
            throw new Error("Không có quyền chỉnh sửa lớp này");
        }
        let _params_update = {
            class_name: params.class_name || details.class_name,
            subject: params.subject || details.subject,
            description: params.description || details.description,
            status: params.status || details.status
        }

        let [up_class, up_class_err] = await this.handle(this.repo.update(id, _params_update));
        if (up_class_err) throw (up_class_err);

        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công"
        }
    }
    async details(id, params) {

        let [details, err] = await this.handle(this.repo.show(id));
        if (err) throw (err);
        if (this.isEmpty(details) || details.status === 'D') {
            throw new Error("Không tìm thấy lớp học này");
        }

        let [user_class, user_class_err] = await this.handle(this.repo_user_class.showByKey(id, params.user_info.id));
        if (user_class_err) throw (user_class_err);
        if (this.isEmpty(user_class)) {
            throw new Error("Bạn chưa tham gia lớp học này");
        }
        if (user_class.role === 'S') delete details.class_code;

        let [owner_info, owner_info_err] = await this.handle(this.repo_user.show(details.owner_id));
        if (owner_info_err) throw (owner_info_err);

        if (this.isEmpty(owner_info)) {
            throw new Error("Không tìm thấy thông tin của giáo viên lớp học này");
        }

        let [listUser, listUser_err] = await this.handle(this.repo_user_class.listByClassId(id));
        if (listUser_err) throw (listUser_err);

        return {
            success: true,
            data: {
                ...details,
                owner_name: owner_info.full_name,
                owner_avatar: owner_info.avatar,
                listUser
            },
            message: "Lấy lớp thành công"
        };
    }

    async detailsByInvite(params) {

        if (this.isEmpty(params.token)) {
            throw new Error("Vui lòng truyền token");
        }

        if (this.isEmpty(params.class_id)) {
            throw new Error("Vui lòng truyền class_id");
        }

        let [details, err] = await this.handle(this.repo.show(params.class_id));
        if (err) throw (err);

        if (this.isEmpty(details)) {
            return {
                success: false,
                data: [],
                message: "Không tồn tại lớp để tham gia"
            }
        }

        let [class_info_by_user, class_info_by_user_err] = await this.handle(this.repo_user_class.showByKey(params.class_id, params.user_info.id));
        if (class_info_by_user_err) throw (class_info_by_user_err);
    
        if (!this.isEmpty(class_info_by_user)) {
          return {
            success: true,
            data: [],
            message: "Bạn đã tham gia lớp này"
          }
        }

        //in case: token get from public link --> Role: S
        let [class_info, class_info_err] = await this.handle(this.repo.showByClassCodeAndId(params.token, params.class_id));
        if (class_info_err) throw class_info_err;

        //in case: token get from private link --> Role: T
        let [invitation, err_invitation] = await this.handle(this.repo_invite.showByTokenAndClassId(params.token, params.class_id));
        if (err_invitation) throw err_invitation;

        //none
        let role = 'N';

        role = this.isEmpty(class_info) ? 'T' : 'S';

        if(role==='N'){
            return {
                success: false,
                data: [],
                message: "Không tồn tại lớp để tham gia"
            }
        }

        let [owner_info, owner_info_err] = await this.handle(this.repo_user.show(details.owner_id));
        if (owner_info_err) throw (owner_info_err);

        return {
            success: true,
            data: {
                ...details,
                owner_name: owner_info.full_name,
                owner_avatar: owner_info.avatar,
                role
            },
            message: "Lấy lớp thành công"
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

module.exports = classroomService;
