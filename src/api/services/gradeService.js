const gradeRepository = require("../repositories/gradeRepository");
const classroomRepository = require("../repositories/classroomRepository");
const userclassRepository = require("../repositories/userclassRepository");
const usersRepository = require("../repositories/usersRepository");
const studentBoardRepository = require("../repositories/studentBoardRepository");
const assignmentRepository = require("../repositories/assignmentRepository");
const { toPath } = require("lodash");
class gradeService {
    constructor() {
        this.repo = new gradeRepository();
        this.repo_classroom = new classroomRepository();
        this.repo_user_class = new userclassRepository();
        this.repo_user = new usersRepository();
        this.repo_student_board = new studentBoardRepository()
        this.repo_assignment = new assignmentRepository();
    }

    async showGradeByClassId(id,params)
    {
        let [details_user, err_details_user] = await this.handle(this.repo_user.show(params.user_info.id));
        if (err_details_user) throw (err_details_user);
        if (this.isEmpty(details_user) || details_user.status === 'D') {
            throw new Error("Không tìm thấy user này");
        }
        if (this.isEmpty(details_user.user_code))
            throw new Error("Bạn chưa cập nhập mã sinh viên")
        let [details_classroom, err_details_classroom] = await this.handle(this.repo_classroom.show(id));
        if (err_details_classroom) throw (err_details_classroom);
        if (this.isEmpty(details_classroom) || details_classroom.status === 'D') {
            throw new Error("Không tìm thấy lớp học này");
        }

        let [user_class, user_class_err] = await this.handle(this.repo_user_class.showByKey(id, params.user_info.id));
        if (user_class_err) throw (user_class_err);
        if (this.isEmpty(user_class)) {
            throw new Error("Bạn chưa tham gia lớp học này");
        }
        let [studentBoard,err_studentBoard] = await(this.handle(this.repo_student_board.showByCodeAndId(details_user.user_code,id)))
        if (err_studentBoard) throw (err_studentBoard);
        let {student_code,full_name} = studentBoard
        let [list_by_sql, list_by_sql_err] = await this.handle(this.repo_assignment.listByClass(id));
        if (list_by_sql_err) throw (list_by_sql_err);
        let listGrade= []
        let totalPoint =0
        let totalWeight =0
        let flage = true
        list_by_sql.map((value,index) =>
        {
            let {id,title,weight,finalized} = value
            let [grade,err_grade] = await this.handle(this.repo.showGradeByCodeAndId(student_code,id))
            if (err_grade) throw (err_grade);
            if(grade)
            {
                totalPoint = totalPoint + grade.grade *grade.weight
                totalWeight = totalWeight + grade.weight
                listGrade.push({...grade})
            }
            else
            {
                listGrade.push({
                    title,
                    weight,
                    finalized,
                    grade: ""
                })
                totalPoint = "Chưa cập nhập đủ điểm"
            }
        })
        if (flage)
            totalPoint= totalPoint/totalWeight
        return {
            success: true,
            data: {
                student_code,
                full_name,
                totalPoint,
                listGrade
            },
            message: "Lấy bảng điểm thành công!"
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

module.exports = gradeService;
