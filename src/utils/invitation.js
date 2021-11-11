const { client } = require('../../config/default');

function genInvitationLink({class_id, token}) {
  return `${client.host}/join?invitation=${token}&class_id=${class_id}`;
}

module.exports = {
  genInvitationLink
}
