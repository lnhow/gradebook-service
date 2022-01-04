const nodemailer = require("nodemailer");
var hbs = require("nodemailer-express-handlebars");
const config = require("config");
const { service, username, password } = config.get("smtp_mail");
const TEMPLATE = [
    {
        template: "invite_class",
        subject: "THƯ MỜI THAM GIA VÀO LỚP HỌC | GRADEBOOK",
    },
    {
        template: "user_activation",
        subject: "KÍCH HOẠT TÀI KHOẢN | GRADEBOOK",
    },
    {
        template: "user_password_forgot",
        subject: "RESET MẬT KHẨU | GRADEBOOK",
    },
];
const options = {
    viewEngine: {
        layoutsDir: __dirname + "/../../../mail_template/layouts",
        extname: ".hbs",
    },
    extName: ".hbs",
    viewPath: "mail_template", //mail_template
};

class usersService {
    constructor() {
        console.log(service,username,password);
        this.transport = nodemailer.createTransport({
            service: service,
            auth: {
                user: username,
                pass: password,
            },
            // tls: {
            //     rejectUnauthorized: true,
            // },
        });
        this.transport.use("compile", hbs(options));
    }

    isValidMailContent(type, content) {

        switch (type) {
            case 1: //INVITE EMAIL
                return (!this.isEmpty(content.invite_user) && !this.isEmpty(content.invite_link));
            case 2: //ACCOUNT ACTIVATION EMAIL
                return (!this.isEmpty(content.activation_link));
            case 3: //ACCOUNT FORGOT PASSWORD EMAIL
                return (!this.isEmpty(content.reset_link));
            default:
                return false;
        }
    }

    getMailInfomation(params) {

        return {
            from: username,
            to: params.email,
            subject: TEMPLATE[params.type - 1].subject,
            template: TEMPLATE[params.type - 1].template,
            context: params.content,
        };
    }

    async sendEmail(params) {

        if (this.isEmpty(params.type)) {
            throw new Error("Vui lòng truyền type");
        }

        if (this.isEmpty(params.email)) {
            throw new Error("Vui lòng truyền email")
        }

        if (this.isEmpty(params.content)) {
            throw new Error("Vui lòng truyền email")
        }

        if (!this.isValidMailContent(params.type, params.content)) {
            throw new Error("Nội dung gửi không hợp lệ");
        }
        let email_info = this.getMailInfomation(params);

        console.log(email_info);
        let [response, err] = await this.handle(this.transport.sendMail(email_info));
        if (err) {
            throw (err)
        }

        return {
            success: true,
            data: [],
            message: "Gửi email thành công"
        }
        // return new Promise((resolve, reject) => {
        //     this.transport.sendMail(email_info, function (err, info) {
        //         if (err) {
        //             let _data = {
        //                 success: false,
        //                 data: [],
        //                 message: err.message,
        //             };
        //             reject(_data);
        //         } else {
        //             let _data = {
        //                 success: true,
        //                 data: info,
        //                 message: "Gửi email thành công!",
        //             };
        //             resolve(_data);
        //         }
        //     });
        // });
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

module.exports = usersService;
