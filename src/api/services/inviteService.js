const invitationCollection = require('../collections/invitationCollection');
const invitationRepository = require('../repositories/invitationRepository');
const userclassRepository = require('../repositories/userclassRepository');
const classroomRepository = require('../repositories/classroomRepository');

const { addDay } = require('../../utils/datetime');
const { genInvitationLink } = require('../../utils/invitation');
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

  /**
   * Get an active inivitation for role
   * @param {class_id, role(optional)} params 
   */
  async getActiveInvitations(params) {
    let [validation, err_validation] = await this.handle(
      this.#validateGetInvitation(params)
    );
    if (err_validation) {
      throw (err_validation);
    }

    let [active_invites, err_active_invite] = await this.handle(
      this.repo.showActive(params.class_id, params.role)
    )
    
    if (err_active_invite || this.isEmpty(active_invites)) {
      //Active invitation not found, create new
      [active_invites, err_active_invite] = await this.handle(
        this.#create(params)
      );
      if (err_active_invite) {
        throw (err_active_invite);
      } else {
        active_invites = [active_invites];
      }
    }

    return {
      success: true,
      data: {
        invites: active_invites.map((invite) => ({
          ...invite,
          link: genInvitationLink(invite),
        }))
      },
      message: 'Lấy lời mời thành công'
    }
  }

  async create(params) {
    let [validation, err_validation] = await this.handle(
      this.#validateGetInvitation(params)
    );
    if (err_validation) {
      throw (err_validation);
    }

    let [invitation, err_invitation] = await this.handle(
      this.#create(params)
    );
    if (err_invitation) {
      throw (err_invitation);
    }

    return {
      success: true,
      data: {
        ...invitation,
        link: genInvitationLink(invitation),
      },
      message: 'Tạo lời mời thành công'
    }
  }

  /**
   * Validate correct get/create params
   */
  async #validateGetInvitation(params) {
    if (this.isEmpty(params.class_id)) {
      throw new Error('Vui lòng truyền class_id');
    }

    if (this.isEmpty(params.role)) {
      params.role = 'S';
    } else {
      params.role = ['S', 'T'].includes(params.role) ? params.role : 'S';
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

    return true;
  }

  /**
   * Private create invitation with NO validation
   */
  async #create(params) {
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
      id: new_invitation.insertId,
      ..._params_new_class_invitation
    };
  }

  /**
   * Disable a class invitation with invite token
   */
  async disable(params) {
    if (this.isEmpty(params.token)) {
      throw new Error('Vui lòng truyền invite token');
    }

    let [invitation, err_invitation] = await this.handle(
      this.repo.showByCol('token', params.token)
    );
    if (err_invitation || this.isEmpty(invitation)) {
      throw new Error('Invite token không hợp lệ');
    }

    let _params_verify_teacher = {
      user_info: params.user_info,
      class_id: invitation.class_id
    }
    //Check is user in class and is a teacher
    let [user_class_info, err_user_class_info] = await this.handle(
      this.verifyTeacher(_params_verify_teacher)
    );
    if (err_user_class_info) {
      throw (err_user_class_info);
    }

    let _params_update = {
      status: 'D'
    }

    let [deleted, err_deleted] = await this.handle(
      this.repo.updateByToken(invitation.token, _params_update)
    );
    if (err_deleted) {
      throw (err_deleted)
    }

    return {
      success: true,
      data: {},
      message: 'Vô hiệu hóa link thành công'
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
