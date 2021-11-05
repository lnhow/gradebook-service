const BaseRepository = require('./baseRepository');

const table = "tbl_user_classroom";

class userclassRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = userclassRepository;