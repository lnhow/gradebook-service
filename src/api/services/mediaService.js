const fs = require('fs');
const gradeService = require('../services/gradeService');
const classroomRepository = require("../repositories/classroomRepository");
const assignmentRepository = require("../repositories/assignmentRepository");
const userclassRepository = require("../repositories/userclassRepository");
const studentBoardRepository = require("../repositories/studentBoardRepository");
const gradeRepository = require("../repositories/gradeRepository");

const ExcelJS = require('exceljs');
const moment = require('moment');
class mediaService {
    constructor() {
        this.class_repo = new classroomRepository();
        this.grade_service = new gradeService();

        this.workbook = new ExcelJS.Workbook();
        this.repo_assignment = new assignmentRepository();

        this.user_class_repo = new userclassRepository();

        this.student_board_repo = new studentBoardRepository();

        this.grade_repo = new gradeRepository();
    }


    async importGrades(params) {

        if (this.isEmpty(params.assignment_id)) {
            return {
                success: false,
                data: null,
                message: "Vui lòng truyền assignment_id"
            }
        }

        let [assignment, assignment_err] = await this.handle(this.repo_assignment.show(params.assignment_id));
        if (assignment_err) throw (assignment_err);
        if (this.isEmpty(assignment) || assignment.status !== 'A') {
            return {
                success: false,
                data: null,
                message: "Không tìm thấy cột điểm này"
            }
        }

        let [class_details, class_details_err] = await this.handle(this.user_class_repo.listByClassId(assignment.class_id));
        if (class_details_err) throw (class_details_err);

        if (this.isEmpty(class_details) || !class_details.length) {
            return {
                success: false,
                data: null,
                message: "Không tìm thấy lớp học này"
            }
        }

        let listTeacher = [];
        class_details.map(item => {
            if (item.role === 'T') {
                listTeacher.push(item.user_id)
            }
        })

        if (!listTeacher.includes(params.user_info.id)) {
            return {
                success: false,
                data: null,
                message: "Chỉ có giáo viên của lớp này mới có quyền import"
            }
        }

        let [list_student, list_student_err] = await this.handle(this.student_board_repo.showListCodeByClassId(assignment.class_id));
        if (list_student_err) throw (list_student_err);
        let list_student_code = list_student.map(item => item.student_code);

        let file_source = `./uploads/file_excel/` + params.file_name;
        await this.workbook.xlsx.readFile(file_source)
        const worksheet = this.workbook.getWorksheet(1);

        if (worksheet.actualRowCount < 3) {
            return {
                success: false,
                data: [],
                message: "Vui lòng import ít nhất 1 dòng dữ liệu"
            }
        }

        for (let i = 0; i <= worksheet.actualRowCount - 3; i++) {
            let check = true;

            //Check MSSV
            let student_code = worksheet.getCell('B' + (i + 4)).value;
            if (!student_code || !list_student_code.includes(student_code)) {
                check = false;
            }

            //Check điểm
            let grade = worksheet.getCell('C' + (i + 4)).value;
            if (!grade || isNaN(grade)) {
                check = false;
            }

            if (check) {
                let [new_grade, new_grade_err] = await this.handle(this.grade_repo.updateByCodeAndId(student_code, params.assignment_id, {
                    grade
                }));
                if (new_grade_err) throw (new_grade_err);
            }

        }


        fs.unlinkSync(file_source);
        return {
            success: true,
            data: [],
            message: "Import thành công"
        }
    }

    async exportGrades(id, params) {

        let data_export = [];

        let [res, err] = await this.handle(this.grade_service.showClassGrade(id, params));
        if (err) throw (err);
        if (res && res.data) {
            data_export = res.data;
        }

        //Lấy tên lớp
        let [class_details, class_details_err] = await this.handle(this.class_repo.show(id));
        if (class_details_err) throw (class_details_err);

        //Lấy danh sách assignment
        let [listAssignment, listAssignment_err] = await this.handle(this.repo_assignment.listByClass(id));
        if (listAssignment_err) throw (listAssignment_err);

        this.workbook._worksheets = [];
        const worksheet = this.workbook.addWorksheet("GradesBoard");

        ////////////////TIÊU ĐỀ///////////////
        worksheet.mergeCells('A1' + ':' + String.fromCharCode(67 + listAssignment.length) + 1);
        worksheet.getCell('A1').value = "Bảng điểm lớp " + class_details.class_name;
        worksheet.getCell('A1').font = {
            bold: true,
            size: 22
        }
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        ///////////////TÊN CỘT////////////////
        ///MSSV////
        worksheet.getCell('A3').value = "Mã số sinh viên";
        worksheet.getCell('A3').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A3').font = {
            bold: true
        }

        ///Hovaten////
        worksheet.getCell('B3').value = "Họ và tên";
        worksheet.getCell('B3').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        worksheet.getCell('B3').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('B3').font = {
            bold: true
        }

        //Cac cot diem
        for (let i = 0; i < listAssignment.length; i++) {

            let cell = String.fromCharCode(67 + i) + 3;
            worksheet.getCell(cell).value = listAssignment[i].title;
            worksheet.getCell(cell).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell(cell).font = {
                bold: true
            }
        }

        //Tongdiem
        worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + 3).value = "Tổng điểm";
        worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + 3).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + 3).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + 3).font = {
            bold: true
        }
        ////////////////NHẬP DATA////////////////
        for (let i = 0; i < data_export.length; i++) {

            //mssv
            worksheet.getCell('A' + (4 + i)).value = data_export[i].student_code;
            worksheet.getCell('A' + (4 + i)).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell('A' + (4 + i)).alignment = { vertical: 'middle', horizontal: 'center' };

            //hovaten
            worksheet.getCell('B' + (4 + i)).value = data_export[i].full_name;
            worksheet.getCell('B' + (4 + i)).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell('B' + (4 + i)).alignment = { vertical: 'middle', horizontal: 'left' };

            //tongdiem
            worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + (4 + i)).value = data_export[i].totalPoint;
            worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + (4 + i)).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell(String.fromCharCode(67 + listAssignment.length) + (4 + i)).alignment = { vertical: 'middle', horizontal: 'center' };

            ////caccotdiem////
            let listGrade = data_export[i].listGrade || [];
            for (let j = 0; j < listGrade.length; j++) {
                let cell = String.fromCharCode(67 + j) + (4 + i);
                worksheet.getCell(cell).value = listGrade[j].grade;
                worksheet.getCell(cell).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
            }
        }

        ////////////////EXPORT//////////////////

        const file_export = `./uploads/gradeboards_${moment().format("DD_MM_YYY_HH_mm_ss")}.xlsx`;
        await this.workbook.xlsx.writeFile(file_export);

        return {
            url: file_export
        }

    }

    async exportTemplateGrades(params) {

        if (this.isEmpty(params.assignment_id)) {
            return {
                success: false,
                data: null,
                message: "Vui lòng truyền assignment_id"
            }
        }

        let [assignment, assignment_err] = await this.handle(this.repo_assignment.show(params.assignment_id));
        if (assignment_err) throw (assignment_err);
        if (this.isEmpty(assignment) || assignment.status !== 'A') {
            return {
                success: false,
                data: null,
                message: "Không tìm thấy cột điểm này"
            }
        }

        let [list_student, list_student_err] = await this.handle(this.student_board_repo.showListCodeByClassId(assignment.class_id));
        if (list_student_err) throw (list_student_err);

        await this.workbook.xlsx.readFile("./uploads/file_excel/template_import_grades.xlsx");
        const worksheet = this.workbook.getWorksheet(1);
        worksheet.getCell('C1').value = "Thêm cột điểm " + assignment.title;
        if (list_student && list_student.length) {
            for (let i = 0; i < list_student.length; i++) {
                worksheet.getCell('B' + (i + 4)).value = list_student[i].student_code;
                worksheet.getCell('B' + (i + 4)).alignment = { vertical: 'middle', horizontal: 'center' };
            }
        }

        const file_export = `./uploads/template_import_grades_${moment().format("DD_MM_YYY_HH_mm_ss")}.xlsx`;
        await this.workbook.xlsx.writeFile(file_export);
        return {
            url: file_export
        }
    }

    async importStudents(params) {
        if (this.isEmpty(params.class_id)) {
            return {
                success: false,
                data: null,
                message: "Vui lòng truyền class_id"
            }
        }

        let [class_details, class_details_err] = await this.handle(this.user_class_repo.listByClassId(params.class_id));
        if (class_details_err) throw (class_details_err);

        if (this.isEmpty(class_details) || !class_details.length) {
            return {
                success: false,
                data: null,
                message: "Không tìm thấy lớp học này"
            }
        }

        let listTeacher = [];
        class_details.map(item => {
            if (item.role === 'T') {
                listTeacher.push(item.user_id)
            }
        })

        if (!listTeacher.includes(params.user_info.id)) {
            return {
                success: false,
                data: null,
                message: "Chỉ có giáo viên của lớp này mới có quyền import"
            }
        }

        let file_source = `./uploads/file_excel/` + params.file_name;
        await this.workbook.xlsx.readFile(file_source)
        const worksheet = this.workbook.getWorksheet(1);

        if (worksheet.actualRowCount < 3) {
            return {
                success: false,
                data: [],
                message: "Vui lòng import ít nhất 1 dòng dữ liệu"
            }
        }

        for (let i = 0; i <= worksheet.actualRowCount - 3; i++) {
            let check = true;

            //Check họ và tên
            let student_code = worksheet.getCell('B' + (i + 4)).value;
            if (!student_code) {
                check = false;
            }

            //Check họ và tên
            let full_name = worksheet.getCell('C' + (i + 4)).value;
            if (!full_name) {
                check = false;
            }

            if (check) {
                let [detail_studentboard, detail_studentboard_err] = await this.handle(this.student_board_repo.showByCodeAndId(student_code, params.class_id));
                if (detail_studentboard_err);

                if (this.isEmpty(detail_studentboard)) {
                    let [new_student, new_student_err] = await this.handle(this.student_board_repo.create({
                        student_code,
                        full_name,
                        class_id: params.class_id
                    }));
                    if (new_student_err) throw (new_student_err);
                }
            }

        }

        if (!worksheet) {
            return {
                success: false,
                data: [],
                message: "Không tìm thấy file"
            }
        }

        fs.unlinkSync(file_source);

        return {
            success: true,
            data: [],
            message: "Import thành công"
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

module.exports = mediaService;
