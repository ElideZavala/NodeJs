const { promisify } = require('util'); // Metodo para crear una utilidad.
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // Utilizamos promisify de util.
  //Obtenemos nuestro Id con las variables id,iat y exp. // Lo mismo realizado en JWT.io.

  // 3) Check if user still exists.
  const currentUser = await User.findById(decoded.id); // tomamos el id de nuestro tokes desestructurado.
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist'), // En caso de que sea false.
      401
    );
  }

  // 4) Check if user changed password after the JWT.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  } // Checar si el usuario a cambiado la contraseña.

  // GRANT ACCESS TO PROTECTED ROUTE.
  req.user = currentUser; // Llegara a este punto en caso de que todo sea correcto.
  next();
});

exports.restricTo = (...roles) => {};
