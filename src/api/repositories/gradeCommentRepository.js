const BaseRepository = require('./baseRepository');

const table = 'tbl_grade_comment';

class gradeCommentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = gradeCommentRepository;