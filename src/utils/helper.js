
const crypto = require('crypto');
const generator = require('generate-password');

const indexOfPropValue = (array, prop, value) => {
  for (let i = 0; i < array.length; ++i) {
    if (array[i][prop]) {
      if (array[i][prop] === value) {
        return i;
      }
    }
  }
  return -1;
};

const removeUnicode = str => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const formatNumber = number => {
  return `${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const convertArrayToObject = (array = [], key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};
function sha512(password, salt) {
  const hash = crypto.createHmac('sha512', getStringValue(salt));
  hash.update(getStringValue(password));
  const passwordHash = hash.digest('hex');

  return {
    salt,
    passwordHash,
  };
}

function getStringValue(data) {
  if (typeof data === 'number' || data instanceof Number) {
    return data.toString();
  }
  if (!Buffer.isBuffer(data) && typeof data !== 'string') {
    throw new TypeError('Data for password or salt must be a string or a buffer');
  }
  return data;
}

function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

function saltHashPassword(password) {
  const salt = genRandomString(16);
  return sha512(getStringValue(password), salt);
}

function desaltHashPassword(password, salt) {
  const hash = crypto.createHmac('sha512', getStringValue(salt));
  hash.update(getStringValue(password));
  return hash.digest('hex');
}

function genPasswrd() {
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  return password;
}

module.exports = {
  removeUnicode,
  sha512,
  convertArrayToObject,
  formatNumber,
  saltHashPassword,
  desaltHashPassword,
  genRandomString,
  genPasswrd
};
