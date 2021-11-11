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

        if(params.user_info.user_type!=='A'){
            let sql = `(SELECT t.class_id FROM tbl_user_classroom t WHERE t.user_id=${params.user_info.id})`;
            this.where('t.id','IN',sql);
        }
    }

    isEmpty(value) {
        return [null, undefined, ""].includes(value);
    }
}

module.exports = classroomCollection;
