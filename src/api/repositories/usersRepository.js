const BaseRepository = require('./baseRepository');

const table = "tbl_users";

class usersRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = usersRepository;