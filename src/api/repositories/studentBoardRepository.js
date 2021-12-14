const BaseRepository = require('./baseRepository');

const table = 'tbl_student_board';

class studentBoardRepository extends BaseRepository {
    constructor() {
        super(table);
    }
    showByCodeAndId(student_code,class_id)
    {
        let sql = 
        `SELECT * FROM ${this.table}
        WHERE class_id=${class_id} AND student_code=${student_code}`;
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

module.exports = studentBoardRepository;