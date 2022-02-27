const mongoose = require('mongoose');
const validator = require('validator'); // Validar en mongoose.
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    // unique: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true, // Will convert the email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'], // We validate a real email
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    mixlength: [8, 'A paswword must have more or equal then 8 characters'],
    // maxlength: [15, 'A paswword less have more or equal then 8 characters'],
    select: false, // La contraseña nunca aparecera automaticamente
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validator: {
      // This only works on CREATE and SAVE!! =>  It will only work when we create a new object
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

// Middleware pre-save
userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next(); // if the password is changed to password.

  // Hash the possword with cost of 12.
  this.password = await bcrypt.hash(this.password, 12); // the password will be encrypted with 12 characters.

  // Delete passwordConfirm field.
  this.passwordConfirm = undefined;

  next();
});

// Creamos un metodo que va a llevar la funcion correctPassword
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // Comparamos estas dos contraseñas y dependiendo nos regresara un true o false.
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime();
    //si no existe nunca ha cambiado la contraseña.-
    console.log(changedTimestamp, JWTTimestamp);
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
