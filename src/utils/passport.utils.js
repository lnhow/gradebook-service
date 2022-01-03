const config = require('../../config/default');
const passport = require('passport');
const { UniqueTokenStrategy } = require('passport-unique-token');

const sessionService = require('../api/services/sessionService');
const service = new sessionService();

const strategyOptions = {
  tokenHeader: config.api.auth_header,
}

passport.use(new UniqueTokenStrategy(strategyOptions,
  (token, done) => {
    // console.log('Token: ' + token);
    // Get user info by token from session db
    service.getUserinfo(token)
    .then((data) => {
      const _user = data.data;
      if (!_user) {
        return done(null, false);
      }
      if (_user.token !== token) {
        throw new Error('Token đã hết hạn, vui lòng đăng nhập lại');
      }
  
      return done(null, _user);
    })
    .catch(err => {
      return done(err);
    });    
}));

module.exports = (app) => {
  app.use(passport.initialize());
}
