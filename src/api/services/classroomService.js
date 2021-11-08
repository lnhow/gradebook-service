/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt@nogistics.vn
 */

const moment = require('moment');

const classroomRepository = require("../repositories/classroomRepository");
const userclassRepository = require("../repositories/userclassRepository");
const classroomCollection = require("../collections/classroomCollection");
const helper = require("../../utils/helper");
const { class_code_token_length } = require("../../utils/constant")

class classroomService {
    constructor() {
        this.repo = new classroomRepository();
        this.col = new classroomCollection();

        this.repo_user_class = new userclassRepository();
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

        this.col.join('tbl_users t2',"t.owner_id","t2.id","");
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
            class_id: new_class.insertId
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

        if(params.user_info.id !== details.owner_id){
            throw new Error("Không có quyền chỉnh sửa lớp này");
        }
        let _params_update = {
            class_name: params.class_name || details.class_name,
            subject: params.subject || details.subject,
            description: params.description || details.description,
            status: params.status || details.status
        }

        let [up_class,up_class_err] = await this.handle(this.repo.update(id,_params_update));
        if(up_class_err) throw(up_class_err);
        
        return {
            success: true,
            data : {
                ..._params_update
            },
            message: "Cập nhật thành công"
        }
    }
    async show(id,params)
    {
        let is_limit = false
        this.col.addSelect([
            "t.*",
            "t2.full_name as owner_name",
            "t2.avatar as owner_avatar"
        ]);
        this.col.join('tbl_users t2',"t.owner_id","t2.id","");
        this.col.filters(params);
        this.col.where('t.id','',id)
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);
        let [data, error] = await this.handle(this.repo.list(sql));
        if (error) throw (error);
        let [total, err] = await this.handle(this.repo.listCount(count));
        if (err) throw (err);
        if (total.total>0)
            return {
                success: true,
                data,
                message: "Lấy lớp thành công"
            }
        else
            return{
                success: false,
                data,
                message: "Bạn chưa join lớp này"
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
