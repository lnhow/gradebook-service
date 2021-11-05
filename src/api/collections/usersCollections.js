/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt@nogistics.vn
 */

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
