const BaseRepository = require('./baseRepository');

const table = "tbl_session";

class sessionRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    removeToken(user_id) {
        let sql = `DELETE FROM ${table} WHERE user_id=${user_id}`;
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, {}, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }

    getUserInfo(token) {
        let sql = ` SELECT s.token,u.id, u.username, u.full_name, u.user_type, u.user_code
                FROM ${table} s 
                JOIN tbl_users u ON u.id = s.user_id
                WHERE s.token='${token}'`;
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

module.exports = sessionRepository;