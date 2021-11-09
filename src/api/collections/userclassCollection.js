const BaseCollection = require('./baseCollection');
const table = "tbl_user_classroom";

class userclassCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = userclassCollection;
