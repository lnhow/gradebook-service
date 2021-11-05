/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt@nogistics.vn
 */

const moment = require('moment');

const sessionRepository = require("../repositories/sessionRepository");
const helper = require("../../utils/helper");
class sessionService {
    constructor() {
        this.repo = new sessionRepository();
    }

    async getUserinfo(token) {
        let [data, err] = await this.handle(this.repo.getUserInfo(token));
        if (err) throw (err);
        return {
            success: true,
            data,
            message: "Lấy token thành công"
        }
    }


    isEmpty(value) {
        return [null, undefined, ""].includes(value);
    }

    handle(promise) {
        return promise
            .then(data => ([data, undefined]))
            .catch(error => Promise.resolve([undefined, error]))
    }
}

module.exports = sessionService;
