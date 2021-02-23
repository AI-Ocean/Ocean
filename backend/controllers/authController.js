const passport = require("passport");
const jwt = require('jsonwebtoken');

// Call User model
const userDAO = require("../models/user");

module.exports.signup = async function (req, res, next) {
  // Field check
  if (!req.body.email || !req.body.password || !req.body.name) {
    return res.status(400).json({
      msg: 'Please pass email, password and name.'
    });
  }
  // Exist check
  const user = await userDAO.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({
      msg: "Same email already exist."
    });
  }

  // Create new user
  let newUser = new userDAO({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name
  });
  // save the user
  try {
    await newUser.save();
  } catch (err) {
      return next(err)
  }
  return res.status(201).json({ msg: 'Successful created new user.' });
};

module.exports.signin = function (req, res, next) {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) return res.status(401).end();
    req.login(user, { session: false }, async (error) => {
      if (error) next(error);
      // issue token
      const token = jwt.sign(
        { 
          email: user.email,
          role: user.role,
          name: user.name
        },
        require('../config/key').SECRET,
        {
          expiresIn: "1d",
          issuer: 'kairos03',
          subject: 'userInfo'
        })
        // record last signin time
        try {
          let userInst = await userDAO.findById(user._id)
          userInst.lastSignin = new Date()
          await userInst.save()
        } catch (err) {
          return next(err)
        }
        return res.json({ token });
    });
  })(req, res);
}