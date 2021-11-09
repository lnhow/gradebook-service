
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
class uploadService {
    constructor() {
    }

    async uploadImage(file_name) {

        const filePath = './uploads/' + file_name;

        let [res, err] = await this.handle(cloudinary.uploader.upload(filePath, { public_id: file_name , folder: 'images', unique_filename: false, overwrite: true }));
        if (err) throw (err);
        fs.unlinkSync(filePath);
        return {
            success: true,
            data: res.secure_url,
            message: "Upload hình thành công"
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

module.exports = uploadService;
