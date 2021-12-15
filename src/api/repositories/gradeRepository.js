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

    updateByCodeAndId(student_code,assignment_id, params) {
        const now_date = new Date();
        params.updated_at = now_date;
    
        const sql = `UPDATE ${this.table} SET ? WHERE student_id=${student_code} AND assignment_id=${assignment_id}`;
    
        return new Promise((resolve, reject) => {
          this.db.connection.query(sql, params, (err, rows) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(rows);
            }
          });
        });
      }
}

module.exports = gradeRepository;