const invitationCollection = require('../collections/invitationCollection');
const invitationRepository = require('../repositories/invitationRepository');

const { addDay } = require('../../utils/datetime');
const helper = require('../../utils/helper');
const { invitation_token_length } = require('../../utils/constant');

const DEFAULT_INVITATION_EXPIRE_AFTER_DAYS = 7; // 7 days 

class inviteService {
  constructor() {
      this.repo = new invitationRepository();
      this.col = new invitationCollection();
  }

  async create(params) {
    if (this.isEmpty(params.class_id)) {
      throw new Error("Vui lòng truyền class_id");
    }

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
