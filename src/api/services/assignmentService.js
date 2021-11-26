const helper = require('../../utils/helper');
const assignmentRepository = require("../repositories/assignmentRepository");
const userclassRepository = require("../repositories/userclassRepository");
class assignmentService {
    constructor() {
        this.repo = new assignmentRepository();
        this.repo_user_class = new userclassRepository();
    }

    async create(params) {

        if (this.isEmpty(params.class_id)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền thêm class_id"
            }
        }

        //verify request user is teacher of this class
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(params.class_id));
        if (list_users_class_err) throw (list_users_class_err);

        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            return {
                success: false,
                data: [],
                message: "Bạn không phải giáo viên của lớp nên không có quyền tạo!"
            }
        }

        //create object
        if (this.isEmpty(params.title)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền title"
            }
        }

        if (this.isEmpty(params.weight)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền weight"
            }
        }

        let [count_assignment, count_assignment_err] = await this.handle(this.repo.countAssignmentByClass(params.class_id));
        if (count_assignment_err) throw (count_assignment_err);

        let position = count_assignment.total || 0;

        let new_assignment_params = {
            class_id: params.class_id,
            title: params.title,
            weight: params.weight,
            status: "A",
            position
        }

        let [new_data, new_data_err] = await this.handle(this.repo.create(new_assignment_params));
        if (new_data_err) throw (new_data_err);

        return {
            success: true,
            data: {
                id: new_data.insertId,
                ...new_assignment_params
            },
            message: "Tạo mới thành công"
        }
    }

    async arrange(params) {
        if (this.isEmpty(params.class_id)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền thêm class_id"
            }
        }

        //verify request user is teacher of this class
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(params.class_id));
        if (list_users_class_err) throw (list_users_class_err);

        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            return {
                success: false,
                data: [],
                message: "Bạn không phải giáo viên của lớp nên không có quyền tạo!"
            }
        }

        if (this.isEmpty(params.list_assignment)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền thêm list_assignment"
            }
        }

        let [list_by_sql, list_by_sql_err] = await this.handle(this.repo.listByClass(params.class_id));
        if (list_by_sql_err) throw (list_by_sql_err);
        let list_assign_id = list_by_sql.map(item => item.id);
        if (!helper.compareArrays(list_assign_id, params.list_assignment)) {
            return {
                success: false,
                data: [],
                message: "Vui lòng truyền đúng dữ liệu"
            }
        }

        for (let i = 0; i < params.list_assignment.length; i++) {
            let [up_position, up_position_err] = await this.handle(this.repo.update(params.list_assignment[i], {
                position: i
            }));
            if (up_position_err) throw (up_position_err);
        }

        return {
            success: true,
            data: [],
            message: "Đổi thứ tự thành công!"
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

module.exports = assignmentService;
