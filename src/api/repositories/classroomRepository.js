const BaseRepository = require('./baseRepository');

const table = "tbl_classrooms";

class classroomRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    showActive(id) {
        const sql = 
            `SELECT t.* 
            FROM ${this.table} t 
            WHERE t.id=${id} AND t.status='A' 
            LIMIT 1`;
    
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else if (rows.length === 1) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = classroomRepository