const studentBoardRepository = require("../repositories/studentBoardRepository");
class studentBoardService {
    constructor() {
        this.repo = new studentBoardRepository();
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

module.exports = studentBoardService;
