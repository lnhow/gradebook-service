const BaseCollection = require('./baseCollection');
const table = "tbl_classrooms";

class classroomCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (!this.isEmpty(params.status)) {
            this.where('t.status', '=', params.status);
        }
    }

    isEmpty(value) {
        return [null, undefined, ""].includes(value);
    }
}

module.exports = classroomCollection;
