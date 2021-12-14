const BaseCollection = require('./baseCollection');

const table = 'tbl_student_board';

class studentBoardCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = studentBoardCollection;
