const BaseRepository = require('./baseRepository');

const table = 'tbl_grade_review';

class gradeReviewRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = gradeReviewRepository;