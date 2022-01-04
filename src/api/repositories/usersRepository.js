const BaseRepository = require('./baseRepository');

const table = "tbl_users";

class usersRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    ///Key = username & user_type
    showByKey(username, user_type) {
        const sql = `SELECT t.* FROM ${this.table} t 
        WHERE t.username = "${username}" AND t.user_type = "${user_type}" 
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

    showByOneTimeCode(ot_code) {
        const sql = `SELECT t.* FROM ${this.table} t
        WHERE t.ot_code = ?`;
        const paramSql = [ot_code];
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, 
              paramSql, 
              (err, rows) => {
              if (err) {
                reject(err);
              }
              else if (rows.length === 1) {
                resolve(rows[0]);
              } else {
                resolve(null); 
              }
            });
        });
    }

    listByType(user_type) {
        const sql = `SELECT t.* FROM ${this.table} t 
        WHERE  t.user_type = "${user_type}"`;
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                  } else {
                    resolve(rows);
                  }
            });
        });
    }
}

module.exports = usersRepository;