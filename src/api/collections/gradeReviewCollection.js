const BaseCollection = require('./baseCollection');

const table = 'tbl_grade_review';

class gradeReviewCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (!this.isEmpty(params.student_id)) {
            this.where('t.student_id', '=', params.student_id);
        }
        if (!this.isEmpty(params.status)) {
            this.where('t.status', '=', params.status);
        }
    }

    isEmpty(value) {
        return [null, undefined, ""].includes(value);
    }
}

module.exports = gradeReviewCollection;
