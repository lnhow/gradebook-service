const notificationCollection = require("../collections/notificationCollection");
const notificationRepository = require("../repositories/notificationRepository");
class notificationService {
    constructor() {
        this.repo = new notificationRepository();
        this.col = new notificationCollection();
    }

    async list(params) {
        let is_limit = true;

        if (this.isEmpty(params.page)) {
            params.page = 5
            is_limit = false;
        }

        // Set Paging
        this.col.setLimit(5);
        this.col.setOffset(parseInt(params.page));

        this.col.addSelect([
            "t.*",
        ]);
        this.col.where("t.is_read", "<>", 'Y');
        this.col.where('t.user_id', "=", params.user_info.id);
        this.col.addSort('t.created_at', 'DESC');
        let count = this.col.finallizeTotalCount();
        let sql = this.col.finallize(is_limit);
        let [data, data_err] = await this.handle(this.repo.list(sql));
        if (data_err) throw (data_err);
        let [total, total_err] = await this.handle(this.repo.listCount(count));
        if (total_err) throw (total_err);

        return {
            success: true,
            data,
            total: total.total,
            message: "Thành công"
        }
    }

    async create(id, title, content, redirect_link) {
        let new_notification_params = {
            user_id: id,
            title: title,
            content: content,
            is_read: "N",
            redirect_link
        }

        let [new_notification, new_notification_err] = await this.handle(this.repo.create(new_notification_params));
        if (new_notification_err) throw (new_notification_err);
    }
    async update(id, params) {
        let [details, details_err] = await this.handle(this.repo.show(id))
        if (details_err) throw (details_err);
        if (this.isEmpty(details))
            throw new Error("Không tìm thấy notification này")
        if (details.user_id != params.user_info.id)
            throw new Error("Bạn không được quyền chỉnh notification này")
        let _params_update = {
            is_read: "Y"
        }
        let [up_notificatipn, up_notification_err] = await this.handle(this.repo.update(id, _params_update));
        if (up_notification_err) throw (up_notification_err);
        return {
            success: true,
            data: {
                ..._params_update
            },
            message: "Cập nhật thành công notification"
        }
    }

    async readAll(params) {
        let [up_read_all, up_read_all_err] = await this.handle(this.repo.readAllNoti(params.user_info.id));
        if (up_read_all_err) throw (up_read_all_err);

        return {
            success: true,
            data: [],
            message: "Cập nhật thành công!"
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
module.exports = notificationService;