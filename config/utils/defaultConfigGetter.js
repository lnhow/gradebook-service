require('dotenv').config(); //Add .env file variable to process.env

const DEFAULT_SMTP_MAIL_USERNAME = '***@gmail.com';
const DEFAULT_SMTP_MAIL_PASSWORD = '**';
const DEFAULT_GOOGLE_OAUTH_CLIENT_ID = '*';
const DEFAULT_CLIENT_HOST = 'localhost:3000';

const getSmtpMailUsername = () => {
  return process.env.SMTP_MAIL_USERNAME || DEFAULT_SMTP_MAIL_USERNAME;
}

const getSmtpMailPassword = () => {
  return process.env.SMTP_MAIL_PASSWORD || DEFAULT_SMTP_MAIL_PASSWORD;
}

const getGoogleOauthClientID = () => {
  return process.env.GOOGLE_OAUTH_CLIENT_ID || DEFAULT_GOOGLE_OAUTH_CLIENT_ID;
}

const getClientHost = () => {
  return process.env.CLIENT_HOST || DEFAULT_CLIENT_HOST;
}

const getMailConfig = () => {
  return {
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT || '3306',
    username: process.env.DB_USERNAME || "",
    dbname: process.env.DB_NAME || "",
    passwrd: process.env.DB_PASSWORD || "",
  }
}

module.exports = {
  getSmtpMailUsername,
  getSmtpMailPassword,
  getGoogleOauthClientID,
  getClientHost,
  getMailConfig,
}
