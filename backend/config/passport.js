const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

// load up the user model
let userDAO = require('../models/user');

// local
const LocalStrategyOption = {
  usernameField: "email",
  passwordField: "password",
};
async function localVerify(email, password, done) {
  let user;
  try {
    user = await userDAO.findOne({email});
    if (!user) return done(null, false);
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (!isSamePassword) return done(null, false);
  } catch (e) {
    return done(e);
  }
  return done(null, user);
}

// JWT
const jwtStrategyOption = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: require('../config/key').SECRET,
};
async function jwtVerify(payload, done) {
  let user;
  try {
    user = await userDAO.findOne({email: payload.email});
    if (!user) return done(null, false);
  } catch (e) {
    return done(e);
  }
  return done(null, user);
}

module.exports = () => {
  passport.use(new LocalStrategy(LocalStrategyOption, localVerify));
  passport.use(new JWTStrategy(jwtStrategyOption, jwtVerify));
};