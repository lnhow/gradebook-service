const gradeCommentCollection = require("../collections/gradeCommentCollection");
const gradeCommentRepository = require("../repositories/gradeCommentRepository");
const gradeReviewRepository = require("../repositories/gradeReviewRepository");
const userclassRepository = require("../repositories/userclassRepository");
const usersRepository = require("../repositories/usersRepository");
class gradeCommentService {
    constructor() {
        this.repo = new gradeCommentRepository();
        this.col = new gradeCommentCollection();
        this.repo_grade_review = new gradeReviewRepository();
        this.repo_user_class = new userclassRepository();
        this.repo_user = new usersRepository();
    }
    async create(params) {
        if (this.isEmpty(params.review_id)) {
            throw new Error("Vui lòng truyền review_id");
        }
        if (this.isEmpty(params.content)) {
            throw new Error("Vui lòng truyền content");
        }

        let [details_grade_review,details_grade_review_err] = await this.handle(this.repo_grade_review.show(params.review_id))
        if (details_grade_review_err) throw (details_grade_review_err);
        if (this.isEmpty(details_grade_review))
            throw new Error("Không tìm thấy grade_review này")
        
        //Verify teacher
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(details_grade_review.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            //Verify owner
            let [user_class, user_class_err] = await this.handle(this.repo_user_class.showByKey(details_grade_review.class_id, params.user_info.id));
            if (user_class_err) throw (user_class_err);
            if (this.isEmpty(user_class)) {
                throw new Error("Bạn chưa tham gia lớp học này");
            }
            let [details_user, details_user_err] = await this.handle(this.repo_user.show(params.user_info.id));
            if (details_user_err) throw (details_user_err);
            if (details_user.user_code != details_grade_review.student_id )
                throw new Error("Bạn không thể bình luận grade review này")
        }

        let _params_new_comment = {
            owner_id: params.user_info.id,
            review_id: params.review_id,
            content: params.content,
            status: "A"
        }

        let [new_comment, new_comment_err] = await this.handle(this.repo.create(_params_new_comment));
        if (new_comment_err) throw (new_comment_err);

        
        return {
            success: true,
            data: {
                id: new_comment.insertId,
                ..._params_new_comment
            },
            message: "Tạo comment thành công"
        }
    }
    async update(id,params)
    {
        
        let [details_comment,details_comment_err] = await this.handle(this.repo.show(id))
        if (details_comment_err) throw (details_comment_err);
        if (this.isEmpty(details_comment) || details_comment.status!="A")
            throw new Error("Không tìm thấy comment này")
        let [details_grade_review,details_grade_review_err] = await this.handle(this.repo_grade_review.show(details_comment.review_id))
        if (details_grade_review_err) throw (details_grade_review_err);

        let [user_class, user_class_err] = await this.handle(this.repo_user_class.showByKey(details_grade_review.class_id, params.user_info.id));
        if (user_class_err) throw (user_class_err);
        if (this.isEmpty(user_class)) {
            throw new Error("Bạn chưa tham gia lớp học này");
        }
        if (details_comment.owner_id != params.user_info.id )
            throw new Error("Bạn không thể chỉnh sửa bình luận này");
        if (!this.isEmpty(params.status) && !["N", "Y", "D"].includes(params.status)) {
            throw new Error("Status phải thuộc A,D");
        }
        let _params_update = {
            content: params.content || details_comment.content,
            status: params.status || details_comment.status
        }
        let [up_gradeComment, up_gradeComment_err] = await this.handle(this.repo.update(id, _params_update));
        if (up_gradeComment_err) throw (up_gradeReview_err);
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công gradeComment"
        }
            
    }

    async list(params)
    {
        if (this.isEmpty(params.review_id)) {
            throw new Error("Vui lòng truyền review_id");
        }

        let [details_grade_review,details_grade_review_err] = await this.handle(this.repo_grade_review.show(params.review_id))
        if (details_grade_review_err) throw (details_grade_review_err);
        if (this.isEmpty(details_grade_review))
            throw new Error("Không tìm thấy grade_review này")
        
        //Verify teacher
        let [list_users_class, list_users_class_err] = await this.handle(this.repo_user_class.listByClassId(details_grade_review.class_id));
        if (list_users_class_err) throw (list_users_class_err);
        if (!this.verifyTeacher(list_users_class, params.user_info.id)) {
            //Verify owner
            let [user_class, user_class_err] = await this.handle(this.repo_user_class.showByKey(details_grade_review.class_id, params.user_info.id));
            if (user_class_err) throw (user_class_err);
            if (this.isEmpty(user_class)) {
                throw new Error("Bạn chưa tham gia lớp học này");
            }
            let [details_user, details_user_err] = await this.handle(this.repo_user.show(params.user_info.id));
            if (details_user_err) throw (details_user_err);
            if (details_user.user_code != details_grade_review.student_id )
                throw new Error("Bạn không thể xem grade review này")
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
            "t2.full_name,t.*",
        ]);
        this.col.join('tbl_users t2', "t.owner_id", "t2.id", "");
        this.col.where("t.review_id","=",params.review_id);
        this.col.where("t.status","=","A");
        this.col.filters(params);
        this.col.addSort('t.created_at', 'DESC');
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);
        let [data, data_err] = await this.handle(this.repo.list(sql));
        if (data_err) throw (data_err);
        let [total,total_err] = await this.handle(this.repo.listCount(count));
        if (total_err) throw (total_err);

        return {
            success: true,
            data,
            total: total.total,
            message: "Lấy danh sách comment thành công"
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
module.exports = gradeCommentService;