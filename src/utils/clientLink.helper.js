const { client } = require('../../config/default');

function genInvitationLink(class_id, token) {
  return `${client.host}/join?invitation=${token}&class_id=${class_id}`;
}

function genForgotPasswordLink(ot_code) {
  return `${client.host}/password/reset?reset_id=${ot_code}`;
}

function genActivationLink(ot_code) {
  return `${client.host}/activation?activation=${ot_code}`;
}

module.exports = {
  genInvitationLink,
  genForgotPasswordLink,
  genActivationLink,
}
