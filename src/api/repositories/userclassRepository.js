const BaseRepository = require('./baseRepository');

const table = "tbl_user_classroom";

class userclassRepository extends BaseRepository {
    constructor() {
        super(table);
    }
    listStudentByClassId(class_id)
    {
        let sql=`SELECT t.user_id,t2.full_name,t2.avatar FROM tbl_user_classroom t JOIN tbl_users t2 ON t.user_id = t2.id WHERE t.class_id =${class_id} `
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
        })
    }

    getActiveUserClassInfo(user_id, class_id) {
        let sql=
            `SELECT t.user_id, t.class_id, t.role
            FROM tbl_user_classroom t
            WHERE t.class_id=${class_id} 
                AND t.user_id=${user_id} 
                AND t.status='A'
            LIMIT 1
            `;

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

module.exports = userclassRepository;