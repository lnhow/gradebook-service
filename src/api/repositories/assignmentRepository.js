const BaseRepository = require('./baseRepository');

const table = "tbl_assignment";

class assignmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    countAssignmentByClass(class_id) {
        let sql = `SELECT COUNT(*) as total FROM ${this.table} WHERE class_id=${class_id} AND status='A'`;
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.length == 0) {
                        resolve(null);
                    }

                    var string = JSON.stringify(rows);
                    var json = JSON.parse(string);

                    resolve(json[0]);
                }
            })
        });
    }

    listByClass(class_id) {
        let sql = `SELECT * FROM ${this.table} WHERE class_id=${class_id} AND status='A'`;
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = assignmentRepository;