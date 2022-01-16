const BaseRepository = require('./baseRepository');

const table = "tbl_notification";

class notificationRepository extends BaseRepository {
    constructor() {
        super(table);
    }

    readAllNoti(user_id) {
        let sql = `UPDATE ${this.table} SET is_read='Y' WHERE user_id=${user_id}`;
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = notificationRepository;