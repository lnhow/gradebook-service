const BaseRepository = require('./baseRepository');

const table = "tbl_classrooms";

class classroomRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = classroomRepository