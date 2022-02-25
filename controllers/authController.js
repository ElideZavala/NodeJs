const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Tomara el id y lo regresara de inmediato en un token.
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Creamos un nuevo Usuario, apartir del req.body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Generamos nuestro token con nuestro _id de mongo, la frase secreta y el tiempo en que expirara el token.
  const token = signToken(newUser._id);

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

  // 1) Check if email and password exit. // Si no hay correo electronico ni contraseña obtenemos este error.
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400)); // con return eviamos la respuesta de error
  }

  // 2) Check if user exits && password is correct.
  const user = await User.findOne({ email }).select('+password'); // Seleccionamos los campos requeridos.

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); // Si el usuario existe no ejecuta ambos, pero si si existe podra executar el segundo // si el password del req.body y el password del usuario son correctos continua.
  }

  // 3) If everything ok, send token to client.
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there.
  let token;
  if (
    // authorization debe de empezar con Bearer
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token.

  // 3) Check if user still exists.

  // 4) Check if user changed password after the JWT.

  next();
});
