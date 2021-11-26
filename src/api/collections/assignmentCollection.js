const BaseCollection = require('./baseCollection');

const table = 'tbl_assignment';

class assignmentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = assignmentCollection;
