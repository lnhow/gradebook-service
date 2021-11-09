const BaseCollection = require('./baseCollection');
const table = "tbl_users";

class usersCollections extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
       
    }
}

module.exports = usersCollections;
