const BaseRepository = require('./baseRepository');

const table = "tbl_notification";

class notificationRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = notificationRepository;