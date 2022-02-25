const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  // Creamos un nuevo Usuario, apartir del req.body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Generamos nuestro token con nuestro _id de mongo, la frase secreta y el tiempo en que expirara el token.
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exit. // Si pasamos el correo y la contraseña
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400)); // con return eviamos la respuesta de error
  }

  // 2) Check if user exits && password is correct.
  const user = await User.findOne({ email }).select('+password'); // Seleccionamos los campos requeridos.

  console.log(user);

  // 3) If everything ok, send token to client.
  const token = '';
  res.status(200).json({
    status: 'success',
    token,
  });
});
