const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
/**
* User Roles
*/
const roles = ['user', 'admin'];

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 128,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'user',
    required: true,
  },
  activated: {
    type: Boolean,
    default: false,
    required: true,
  },
  picture: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', function (next) {
  var user = this;

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) throw err;

        user.password = hash;
        return next();
      });
    });
  } else {
    return next();
  }
});

module.exports = mongoose.model('User', UserSchema);