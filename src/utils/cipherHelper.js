/*
 * Copyright (c) Phó Trí Dũng 2021. All Rights Reserved.
 */

const config = require('config');
const generator = require('generate-password');

const {
  secret, ttl, algorithm, inputEncoding, outputEncoding,
} = config.get('auth.resetPassword');


function uniqueID(length) {
  return chr4() + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() + chr4() + chr4();
}

function chr4(length) {
  return Math.random().toString(length).slice(-4);
}

function generateResetPasswordToken(userId) {
  const text = JSON.stringify({ userId, valid: new Date().getTime() + ttl });

  const cipher = crypto.createCipher(algorithm, secret);
  let ciphered = cipher.update(text, inputEncoding, outputEncoding);
  ciphered += cipher.final(outputEncoding);

  return ciphered;
}

function genPasswrd() {
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  return password;
}

function decipherResetPasswordToken(ciphered) {
  const decipher = crypto.createDecipher(algorithm, secret);
  let deciphered = decipher.update(ciphered, outputEncoding, inputEncoding);
  deciphered += decipher.final(inputEncoding);

  return JSON.parse(deciphered);
}

function generateMD5(str) {
  const hash = crypto.createHash('md5').update(str).digest("hex");
  return hash;
}

module.exports = {
  desaltHashPassword,
  generateResetPasswordToken,
  decipherResetPasswordToken,
  genPasswrd,
  uniqueID,
  generateMD5
};
