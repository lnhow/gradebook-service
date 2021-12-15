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
        const updated_at = now_date.toISOString();
        const grade = params.grade;

        let paramQuery = [
          student_code, assignment_id, grade, updated_at, updated_at, // On insert
          grade, updated_at // On update
        ];

        const sql = `INSERT INTO ${this.table}` +
          ` (student_id, assignment_id, grade, created_at, updated_at)`+
          ` VALUES(?, ?, ?, ?, ?)` +
          ` ON DUPLICATE KEY UPDATE` + 
          ` grade=?, updated_at=?`;
        // This below does not insert if not exist
        //const sql = `UPDATE ${this.table} SET ? WHERE student_id=${student_code} AND assignment_id=${assignment_id}`;
    
        return new Promise((resolve, reject) => {
          this.db.connection.query(sql, 
            paramQuery, 
            (err, rows) => {
            if (err) {
              console.log(err);
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