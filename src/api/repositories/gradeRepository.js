const BaseRepository = require('./baseRepository');

const table = "tbl_grades";

class gradeRepository extends BaseRepository {
    constructor() {
        super(table);
    }
    showGradeByCodeAndId(student_code,assignment_id)
    {
        let sql = 
        `SELECT t.id,t.title,t.weight,t.finalized,t1.grade,t1.created_at,t1.updated_at FROM tbl_assignment t JOIN ${this.table} t1 ON t1.assignment_id=t.id
        WHERE t.id = ${assignment_id} AND t.status='A' AND t1.student_id=${student_code}`;
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

module.exports = gradeRepository;