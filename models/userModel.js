const mongoose = require('mongoose');
const validator = require('validator'); // Validar en mongoose.

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true, // Transformara el correo electronico en minusculas.
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    mixlength: [8, 'A paswword must have more or equal then 8 characters'],
    // maxlength: [15, 'A paswword less have more or equal then 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validator: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'PasswworConfirm must equal to password',
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
