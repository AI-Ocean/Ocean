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
    return res.status(201).json({ msg: 'Successful created new user.' });
  } catch (err) {
    return next(err)
  }
};

module.exports.signin = function (req, res, next) {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) return res.status(401).end();
    req.login(user, { session: false }, (error) => {
      if (error) next(error);
      const token = jwt.sign(
        { 
          email: user.email,
          role: user.role,
          name: user.name
        },
        require('../config/key').SECRET,
        {
          expiresIn: "5m",
          issuer: 'kairos03',
          subject: 'userInfo'
        })
        return res.json({ token });
    });
  })(req, res);
}

    // check 
    // User.findOne({ email: req.body.email }, function(err, user) {
    //     console.log(user)
    //     if (err) throw err;
    //     if (!user) {
    //         return res.status(401).json({msg: 'Authentication failed. User not found.'});
    //     } else {
    //         // check if password matches
    //         user.comparePassword(req.body.password, function (err, isMatch) {
    //             if (isMatch && !err) {
    //                 // if user is found and password is right create a token
    //                 let token = jwt.sign(user, config.SECRET, {
    //                     expiresIn: '1h',
    //                     issuer: 'kairos03',
    //                     subject: 'userInfo'
    //                 });
    //                 // return the information including token as JSON
    //                 return res.json({token});
    //             } else {
    //                 return res.status(401).json({msg: 'Authentication failed. Wrong password.'});
    //             }
    //         });
    //     }
    // });
// };