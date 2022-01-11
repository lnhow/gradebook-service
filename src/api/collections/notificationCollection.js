const BaseCollection = require('./baseCollection');

const table = 'tbl_notification';

class notificationCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {

    }
}

module.exports = notificationCollection;
