const BaseRepository = require('./baseRepository');

const table = 'tbl_invitation';

class invitationRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    /**
     * Show active invitation for a role sort by expire longest
     * @param {*} class_id 
     * @param {*} role 
     * @returns 
     */
    showActive(class_id, role='S') {
        const sql = 
            `SELECT t.* 
            FROM ${this.table} t 
            WHERE t.class_id=${class_id} AND t.role='${role}'
            AND t.status='A' AND t.expire_at > CURRENT_TIMESTAMP
            ORDER BY t.expire_at DESC
            LIMIT 1`; // Limit only 1 active link per role per classroom
    
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    resolve(rows);
                }
            });
        });
    }

    showByTokenAndClassId(token,class_id) {
      const sql =
          `SELECT t.* 
          FROM ${this.table} t 
          WHERE t.token='${token}' AND t.class_id =${class_id} AND t.status='A' AND t.expire_at > CURRENT_TIMESTAMP
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

    updateByToken(token, params) {
        const sql = `UPDATE ${this.table} SET ? WHERE token= ?`;
    
        return new Promise((resolve, reject) => {
          this.db.connection.query(sql, [params, token], (err, rows) => {
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

module.exports = invitationRepository;
