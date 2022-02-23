const mongoose = require('mongoose');

// name, email. photo, password, passwordConfirm.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    mixlength: [8, 'A paswword must have more or equal then 8 characters'],
    maxlength: [15, 'A paswword less have more or equal then 8 characters'],
  },
  passwordConfirm: {
    type: String,
    validator: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'PasswworConfirm must equal to password',
    },
  },
});

const User = mongoose.model('User', userSchema);
