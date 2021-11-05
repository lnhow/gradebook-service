/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt@nogistics.vn
 */

const BaseCollection = require('./baseCollection');
const table = "tbl_classrooms";

class classroomCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

        let sql = `(SELECT class_id FROM tbl_user_classroom WHERE user_id=${params.user_info.id}) `
        this.where('t.id', 'IN', sql);
    }
}

module.exports = classroomCollection;
