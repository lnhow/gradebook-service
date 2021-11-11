const invitationCollection = require('../collections/invitationCollection');
const invitationRepository = require('../repositories/invitationRepository');
const userclassRepository = require('../repositories/userclassRepository');
const classroomRepository = require('../repositories/classroomRepository');

const { addDay } = require('../../utils/datetime');
const { genInvitationLink } = require('../../utils/invitation');
const helper = require('../../utils/helper');
const { invitation_token_length } = require('../../utils/constant');
const emailService = require('../services/emailService');
const DEFAULT_INVITATION_EXPIRE_AFTER_DAYS = 7; // 7 days

class inviteService {
  constructor() {
    this.repo = new invitationRepository();
    this.col = new invitationCollection();

    this.repo_user_class = new userclassRepository();
    this.repo_classroom = new classroomRepository();

    this.email_service = new emailService();
  }

  async create(params) {

    //Validate
    if (this.isEmpty(params.class_id)) {
      throw new Error('Vui lòng truyền class_id');
    }

    if (this.isEmpty(params.email)) {
      throw new Error('Vui lòng truyền email');
    }

    if (this.isEmpty(params.role)) {
      throw new Error('Vui lòng truyền role');
    }

    let [class_info, err_class_info] = await this.handle(this.repo_classroom.show(params.class_id));
    if (err_class_info || this.isEmpty(class_info)) {
      throw new Error('Lớp học không tồn tại');
    }

    //Check is user in class and is a teacher
    let [user_class_info, err_user_class_info] = await this.handle(this.verifyTeacher(params));
    if (err_user_class_info) {
      throw (err_user_class_info);
    }

    let token = (params.role === 'S') ? class_info.class_code : await this.genTokenInvite(param.class_id, class_info.class_code);
    //Create token if role is teacher
    if (params.role === 'T') {
      //Create token
      const expireTime = addDay(Date.now(), DEFAULT_INVITATION_EXPIRE_AFTER_DAYS);
      let _params_new_class_invitation = {
        class_id: params.class_id,
        token,
        expire_at: expireTime,
      }

      let [invitation, err_invitation] = await this.handle(this.repo.create(_params_new_class_invitation));
      if (err_invitation) {
        throw (err_invitation);
      }
    }

    //Send email
    let params_invite_email = {
      type: 1,
      email: params.email,
      content: {
        invite_user: params.user_info.full_name,
        invite_link: genInvitationLink(params.class_id, token)
      }
    }
    let [send_email, send_email_err] = await this.handle(this.email_service.sendEmail(params_invite_email));
    if (send_email_err) throw (send_email_err);

    return {
      success: true,
      data: [],
      message: 'Tạo lời mời thành công'
    }
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

  async join(params) {
    if (this.isEmpty(params.token)) {
      throw new Error('Vui lòng truyền invite token');
    }

    if (this.isEmpty(params.class_id)) {
      throw new Error('Vui lòng truyền class_id');
    }

    let [class_info_by_user, class_info_by_user_err] = await this.handle(this.repo_user_class.showByKey(params.class_id, params.user_info.id));
    if (class_info_by_user_err) throw (class_info_by_user_err);

    if (!this.isEmpty(class_info_by_user)) {
      return {
        success: true,
        data: [],
        message: "Tham gia thành công"
      }
    }

    //in case: token get from public link --> Role: S
    let [class_info, class_info_err] = await this.handle(this.repo_classroom.showByClassCodeAndId(params.token, params.class_id));
    if (class_info_err) throw class_info_err;

    //in case: token get from private link --> Role: T
    let [invitation, err_invitation] = await this.handle(this.repo.showByTokenAndClassId(params.token, params.class_id));
    if (err_invitation) throw err_invitation;

    if (this.isEmpty(class_info) && this.isEmpty(invitation)) {
      throw new Error('Không tồn tại lớp để tham gia');
    }

    //Create user class record
    let params_user_class = {
      user_id: params.user_info.id,
      class_id: params.class_id,
      role: this.isEmpty(invitation) ? 'S' : 'T'
    }

    let [new_member, new_member_err] = await this.handle(this.repo_user_class.create(params_user_class));
    if (new_member_err) throw (new_member_err);

    //Delete invite token
    let [del_ivtoken, del_ivtoken_err] = await this.handle(this.repo.deleteByCol("token", params.token));
    if (del_ivtoken_err) throw (del_ivtoken_err);

    return {
      success: true,
      data: [],
      message: "Tham gia thành công"
    }
  }

  async genTokenInvite(class_id, class_code) {

    let token = helper.genRandomString(invitation_token_length);
    let [invitation, err_invitation] = await this.handle(this.repo.showByTokenAndClassId(token, class_id));
    if (err_invitation) {
      throw err_invitation;
    }

    if (this.isEmpty(invitation) && token !== class_code) {
      return token;
    }
    return this.genTokenInvite(class_code);
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
