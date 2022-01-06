const BaseRepository = require('./baseRepository');

const table = 'tbl_grade_review';

class gradeReviewRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    showByCodeAndId(student_code, assignment_id, status) {
        let sql = `SELECT t.* FROM ${this.table} t WHERE t.student_id='${student_code}' AND t.status='${status}' AND t.assignment_id=${assignment_id}`;
        console.log(sql);
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else if (rows.length === 1) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            });
        })
    }
}

module.exports = gradeReviewRepository;