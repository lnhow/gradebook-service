const BaseCollection = require('./baseCollection');

const table = 'tbl_invitation';

class invitationCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = invitationCollection;
