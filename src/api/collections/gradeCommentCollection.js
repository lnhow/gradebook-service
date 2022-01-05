const BaseCollection = require('./baseCollection');

const table = 'tbl_grade_comment';

class gradeCommentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }

}

module.exports = gradeCommentCollection;
