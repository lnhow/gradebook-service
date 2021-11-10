const BaseRepository = require('./baseRepository');

const table = 'tbl_invitation';

class invitationRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = invitationRepository;
