require('dotenv').config(); //Add .env file variable to process.env

const DEFAULT_SMTP_MAIL_USERNAME = '***@gmail.com';
const DEFAULT_SMTP_MAIL_PASSWORD = '**';
const DEFAULT_GOOGLE_OAUTH_CLIENT_ID = '*';

const getSmtpMailUsername = () => {
  return process.env.SMTP_MAIL_USERNAME || DEFAULT_SMTP_MAIL_USERNAME;
}

const getSmtpMailPassword = () => {
  return process.env.SMTP_MAIL_PASSWORD || DEFAULT_SMTP_MAIL_PASSWORD;
}

const getGoogleOauthClientID = () => {
  return process.env.GOOGLE_OAUTH_CLIENT_ID || DEFAULT_GOOGLE_OAUTH_CLIENT_ID;
}

module.exports = {
  getSmtpMailUsername,
  getSmtpMailPassword,
  getGoogleOauthClientID,
}
