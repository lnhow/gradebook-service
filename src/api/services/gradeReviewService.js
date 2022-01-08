const gradeReviewCollection = require("../collections/gradeReviewCollection");
const gradeReviewRepository = require("../repositories/gradeReviewRepository");
const userclassRepository = require("../repositories/userclassRepository");
const usersRepository = require("../repositories/usersRepository");
const assignmentRepository = require("../repositories/assignmentRepository");
const gradeRepository = require("../repositories/gradeRepository");


class gradeReviewService {
    constructor() {
        this.repo = new gradeReviewRepository();
        this.col = new gradeReviewCollection();
        this.repo_user_class = new userclassRepository();
        this.repo_user = new usersRepository();

        this.repo_assignment = new assignmentRepository();
        this.repo_grade = new gradeRepository();
    }
    async list(params) {
        if (this.isEmpty(params.class_id)) {
            throw new Error("Vui lòng truyền class_id");
        }

        let is_limit = true;

        if (this.isEmpty(params.page)) {
            params.page = 5
            is_limit = false;
        }

        if (!this.isEmpty(params.status) && !["N", "Y", "D"].includes(params.status)) {
            throw new Error("Status phải thuộc N,Y,D");
        }

        let [details, details_err] = await this.handle(this.repo_user.show(params.user_info.id));
        if (details_err) throw (details_err);

        let role = 'T';
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(params.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyUser(list_users_class, params.user_info.id, 'T')) {
            if (details.user_code) {
                params.student_id = details.user_code;
                role = 'S'
            }
            else {
                return {
                    success: false,
                    data: [],
                    message: "Tài khoản bạn chưa cập nhập mã sinh viên"
                }
            }
        }

        // Set Paging
        this.col.setLimit(5);
        this.col.setOffset(parseInt(params.page));

        this.col.addSelect([
            "t.*",
        ]);
        this.col.where("t.class_id", "=", params.class_id);
        this.col.where("t.status", "<>", 'D');

        this.col.filters(params);
        this.col.addSort('t.created_at', 'DESC');
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);
        let [data, data_err] = await this.handle(this.repo.list(sql));
        if (data_err) throw (data_err);
        let [total, total_err] = await this.handle(this.repo.listCount(count));
        if (total_err) throw (total_err);


        for (let i = 0; i < data.length; i++) {

            let [current_grade, current_grade_err] = await this.handle(this.repo_grade.showGradeByCodeAndId(data[i].student_id, data[i].assignment_id));
            if (current_grade_err) throw (current_grade_err);

            if (current_grade) {
                data[i].current_grade = current_grade.grade;
            }

            if (role === 'S') {
                data[i].owner_name = params.user_info.full_name;
                data[i].owner_avatar = params.user_info.avatar;
            }
            else {
                let [detail_student, detail_student_err] = await this.handle(this.repo_user.showByStudentCode(data[i].student_id));
                if (detail_student_err) throw (detail_student_err);

                if (detail_student) {
                    data[i].owner_avatar = detail_student.avatar;
                    data[i].owner_name = detail_student.full_name;
                }
            }
        }
        return {
            success: true,
            data,
            total: total.total,
            message: "Lấy danh sách grade_review thành công"
        }
    }

    async create(params) {

        if (this.isEmpty(params.user_info.user_code)) {
            return {
                success: false,
                data: [],
                message: "Tài khoản bạn chưa cập nhập mã sinh viên"
            }
        }

        if (this.isEmpty(params.assignment_id)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền assignment_id"
            }
        }

        let [check_exist, check_exist_err] = await this.handle(this.repo.showByCodeAndId(params.user_info.user_code, params.assignment_id, 'N'));
        if (check_exist_err) throw (check_exist_err);

        if (!this.isEmpty(check_exist)) {
            return {
                success: false,
                data: [],
                message: "Đã tạo khiếu nại cột điểm này"
            }
        }

        if (this.isEmpty(params.expected_grade)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền expected_grade"
            }
        }

        if (this.isEmpty(params.explanation)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền explanation"
            }
        }

        let [assignment_detail, assignment_detail_err] = await this.handle(this.repo_assignment.show(params.assignment_id));
        if (assignment_detail_err) throw (assignment_detail_err);

        if (this.isEmpty(assignment_detail)) {
            return {
                success: false,
                data: [],
                message: "Không tìm thấy cột điểm này"
            }
        }

        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(assignment_detail.class_id));
        if (list_users_class_err) throw (list_users_class_err);

        if (!this.verifyUser(list_users_class, params.user_info.id, 'S')) {
            return {
                success: false,
                data: [],
                message: "Bạn không đủ thẩm quyền"
            }
        }

        let _params = {
            student_id: params.user_info.user_code,
            assignment_id: params.assignment_id,
            class_id: assignment_detail.class_id,
            expected_grade: params.expected_grade,
            status: "N",
            explanation: params.explanation
        }

        let [new_gradereview, new_gradereview_err] = await this.handle(this.repo.create(_params));
        if (new_gradereview_err) throw (new_gradereview_err);

        return {
            success: true,
            data: {
                id: new_gradereview.insertId,
                ..._params
            },
            message: "Tạo thành công"
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
        if (!this.verifyUser(list_users_class, params.user_info.id, 'T')) {
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

        if (params.status === 'Y') {
            let [current_grade, current_grade_err] = await this.handle(this.repo_grade.showGradeByCodeAndId(details.student_id, details.assignment_id));
            if (current_grade_err) throw (current_grade_err);

            if (current_grade) {
                console.log(current_grade);
                let [up_current_grade, up_current_grade_err] = await this.handle(this.repo_grade.update(current_grade.grade_id, {
                    grade: params.final_grade || details.final_grade
                }));
                if (up_current_grade_err) throw (up_current_grade_err)
            }
        }
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công gradeReview"
        }
    }

    verifyUser(list_users_class, user_id, role) {
        let check = false;
        list_users_class.map(item => {
            if (role) {
                if (item.role === role && item.user_id === user_id) {
                    check = true;
                }
            }
            else {
                if (item.user_id === user_id) {
                    check = true;
                }
            };

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