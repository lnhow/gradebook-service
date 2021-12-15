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

    async showGradeStudentByClassId(id,params)
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
        if (this.isEmpty(studentBoard))
            throw new Error("Bạn không có trong danh sách lớp")

        let {student_code,full_name} = studentBoard
        let [listAssignment, err_listAssignment] = await this.handle(this.repo_assignment.listByClass(id));
        if (err_listAssignment) throw (err_listAssignment);
        let {totalPoint,listGrade} = await this.getGrade(listAssignment,student_code)
        return {
            success: true,
            data: {
                student_code,
                full_name,
                totalPoint,
                listGrade
            },
            message: "Lấy bảng điểm sinh viên thành công!"
        }
    }

    async showClassGrade(id,params)
    {

       let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            return {
                success: false,
                data: [],
                message: "Bạn không phải giáo viên của lớp nên không có quyền xem điểm toàn bộ sinh viên!"
            }
        } 

        let [listAssignment, err_listAssignment] = await this.handle(this.repo_assignment.listByClass(id));
        if (err_listAssignment) throw (err_listAssignment);
        console.log(listAssignment)
        let [listCode,err_listCode] = await(this.handle(this.repo_student_board.showListCodeByClassId(id)))
        if (err_listCode) throw (err_listCode);

        let gradeClass = []
        for (let i = 0; i < listCode.length; i++) {
            let {student_code,full_name} =listCode[i]
            console.log(student_code,full_name)
            let {totalPoint,listGrade} = await this.getGrade(listAssignment,student_code)
            gradeClass.push({
                student_code,
                full_name,
                totalPoint,
                listGrade
            })
        }
        return {
            success: true,
            data: gradeClass,
            message: "Lấy bảng điểm lớp thành công!"
        }
    }
    
    async update(params)
    {
        let {student_id,assignment_id,grade} = params
        if (this.isEmpty(student_id))
            throw new Error("Vui lòng truyền mã sinh viên")
        if (this.isEmpty(assignment_id))
            throw new Error("Vui lòng truyền mã sinh viên")
        let [assignmentDetails,err_assignmentDetails] = await this.handle(this.repo_assignment.show(assignment_id))
        if(err_assignmentDetails) throw (err_assignmentDetails)

        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(assignmentDetails.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            return {
                success: false,
                data: [],
                message: "Bạn không phải giáo viên của lớp nên không có quyền chỉnh sửa điểm sinh viên!"
            }
        } 
        let _params_update = {
            grade
        }
        let [up_grade, up_grade_err] = await this.handle(this.repo.updateByCodeAndId(student_id,assignment_id, _params_update));
        if (up_grade_err) throw (up_grade_err);
        return {
            success: true,
            data: 
            {
                student_id,
                assignment_id,
                ..._params_update
            },
            message: "Update điểm thành công!"
        }
    }

    async getGrade(listAssignment,student_code)
    {
        let listGrade= []
        let totalPoint =0
        let totalWeight =0
        let flage = true
        for (let i=0;i< listAssignment.length;i++)
        {
            let {id,title,weight,finalized} = listAssignment[i]
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
                flage=false
                listGrade.push({
                    id,
                    title,
                    weight,
                    finalized,
                    grade: "",
                    created_at:"",
                    updated_at:"",
                })
                totalPoint = "Chưa cập nhập đủ điểm"
            }
        }
        if (flage)
        {
            totalPoint= Math.round(totalPoint/totalWeight* 100) / 100
        }
        return {
            listGrade,
            totalPoint
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

module.exports = gradeService;
