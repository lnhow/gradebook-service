const invitationCollection = require('../collections/invitationCollection');
const invitationRepository = require('../repositories/invitationRepository');
const userclassRepository = require('../repositories/userclassRepository');
const classroomRepository = require('../repositories/classroomRepository');

const { addDay } = require('../../utils/datetime');
const helper = require('../../utils/helper');
const { invitation_token_length } = require('../../utils/constant');

const DEFAULT_INVITATION_EXPIRE_AFTER_DAYS = 7; // 7 days 

class inviteService {
  constructor() {
      this.repo = new invitationRepository();
      this.col = new invitationCollection();

      this.repo_user_class = new userclassRepository();
      this.repo_classroom = new classroomRepository();
  }

  async create(params) {
    //Validation-----
    if (this.isEmpty(params.class_id)) {
      throw new Error('Vui lòng truyền class_id');
    }

    //Check if class exist
    let [class_info, err_class_info] = await this.handle(
      this.repo_classroom.showActive(params.class_id)
    );
    if (err_class_info || this.isEmpty(class_info)) {
      throw new Error('Lớp học không tồn tại');
    }

    //Check is user in class and is a teacher
    let [user_class_info, err_user_class_info] = await this.handle(
      this.verifyTeacher(params)
    );
    if (err_user_class_info) {
      throw (err_user_class_info);
    }
    //Validation-----

    const expireTime = addDay(Date.now(), DEFAULT_INVITATION_EXPIRE_AFTER_DAYS);
    let _params_new_class_invitation = {
      class_id: params.class_id,
      token: helper.genRandomString(invitation_token_length),
      role: params.role || 'S',
      expire_at: expireTime,
    }

    let [new_invitation, new_invitation_err] = await this.handle(
      this.repo.create(_params_new_class_invitation)
    );
    if (new_invitation_err) throw (new_invitation_err);

    return {
      success: true,
      data: {
          id: new_invitation.insertId,
          ..._params_new_class_invitation
      },
      message: 'Tạo lời mời thành công'
    }
  }

  async verifyTeacher(params) {
    let [user_class_info, err_user_class_info] = await this.handle(
      this.repo_user_class.getActiveUserClassInfo(params.user_info.id, params.class_id)
    );
    if (err_user_class_info) throw (err_user_class_info);
    
    // Check user in classroom
    if (this.isEmpty(user_class_info)) {
      throw new Error('Không có quyền thực hiện hành động này');
    }

    // Check user role
    if (user_class_info.role !== 'T') {
      throw new Error('Không có quyền thực hiện hành động này');
    }

    return {
      success: true,
      data: {
        ...user_class_info,
      },
      message: 'Xác nhận thành công'
    };
  }

  isEmpty(value) {
    return [null, undefined, ''].includes(value);
  }

  handle(promise) {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]))
  }
}

module.exports = inviteService;
