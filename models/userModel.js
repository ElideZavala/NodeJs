const crypto = require('crypto'); // Puntos critograficos.
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], // Especificamos los tipos de usuarios validos.
    default: 'user',
  },
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
  passwordResetToken: String,
  passwordResetExpires: Date, // El restablecimiento caducara despues de un cierto periodo de tiempo.
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
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); // En caso de no haber modificado la contraseña. continuamos o si el documento es nuevo.

  this.passwordChangedAt = Date.now() - 1000; //pondra la contraseña con un segundo en el pasado --Aseguramos que token simpre se cree después de que haya cambiado la contraseña
  next();
});

// Creamos un metodo que va a llevar la funcion correctPassword
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // Comparamos estas dos contraseñas y dependiendo nos regresara un true o false.
};

// Marcar el tiempo en que fue emitido el token.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //si no existe nunca ha cambiado la contraseña.-
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, // Nos regresara un entero.. con base en 10.
      10
    );

    return JWTTimestamp < changedTimestamp; // El dia y la hora en que se emitio el token fue menor // 100 < 200
    // Significa que la contraseña a cambiado.
  }

  // False means NOT changes // La contraseña aun no ha cambiado.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Metodo randomBytes, especificar la cantidad de caracteres. // Especificar la opcion hexadecimal. // Contraseña de restablecimiento para crear otra.

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // aLgoritmo, contraseña a cambiar y almacenarlo como hexagonal.

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Tiempo para expirar enta password temporal.

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
