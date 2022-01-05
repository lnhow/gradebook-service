const gradeReviewCollection = require("../collections/gradeReviewCollection");
const gradeReviewRepository = require("../repositories/gradeReviewRepository");
const userclassRepository = require("../repositories/userclassRepository");
const usersRepository = require("../repositories/usersRepository");
class gradeReviewService {
    constructor() {
        this.repo = new gradeReviewRepository();
        this.col = new gradeReviewCollection();
        this.repo_user_class = new userclassRepository();
        this.repo_user = new usersRepository()
    }
    async list(params)
    {
        if (this.isEmpty(params.class_id)) {
            throw new Error("Vui lòng truyền class_id");
        }

        if (this.isEmpty(params.page)) {
            throw new Error("Vui lòng truyền page");
        }

        if (!this.isEmpty(params.status) && !["N", "Y", "D"].includes(params.status)) {
            throw new Error("Status phải thuộc N,Y,D");
        }

        let [details, details_err] = await this.handle(this.repo_user.show(params.user_info.id));
        if (details_err) throw (details_err);

        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(params.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            if (details.user_code)
                params.student_id = details.user_code
            else
                throw new Error("Tài khoản bạn chưa cập nhập mã sinh viên")
        }
        let is_limit = true;

        // Set Paging
        if (!this.isEmpty(params.page)) {
            this.col.setLimit(5);
            this.col.setOffset(parseInt(params.page));
        } else {
            is_limit = false;
        }
        this.col.addSelect([
            "t.*",
        ]);
        this.col.filters(params);
        this.col.addSort('t.created_at', 'DESC');
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);
        console.log(sql)
        let [data, data_err] = await this.handle(this.repo.list(sql));
        if (data_err) throw (data_err);
        let [total,total_err] = await this.handle(this.repo.listCount(count));
        if (total_err) throw (total_err);

        return {
            success: true,
            data,
            total: total.total,
            message: "Lấy danh sách grade_review thành công"
        }
    }

    async update(id, params) {
        let [details, details_err] = await this.handle(this.repo.show(id));
        if (details_err) throw (details_err);
        if (this.isEmpty(details)) {
            throw new Error("Không tìm thấy grade_review này");
        }
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(details.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            throw new Error("Bạn không đủ thẩm quyền")
        }

        if (!this.isEmpty(params.status) && !["N", "Y", "D"].includes(params.status)) {
            throw new Error("Status phải thuộc N,Y,D");
        }

        let _params_update = {
            final_grade: params.final_grade || details.final_grade,
            status: params.status || details.status
        }
        let [up_gradeReview, up_gradeReview_err] = await this.handle(this.repo.update(id, _params_update));
        if (up_gradeReview_err) throw (up_gradeReview_err);
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công gradeReview"
        }
    }

    verifyTeacher(list_users_class, user_id) {
        let check = false;
        list_users_class.map(item => {
            if (item.role === 'T' && item.user_id === user_id) {
                check = true;
            }
        });
        return check;
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

module.exports = gradeReviewService;