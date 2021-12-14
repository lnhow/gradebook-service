const BaseCollection = require('./baseCollection');

const table = 'tbl_grades';

class gradeCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = gradeCollection;
