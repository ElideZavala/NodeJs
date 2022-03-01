const crypto = require('crypto'); // Encriptacion.
const { promisify } = require('util'); // Metodo para crear una utilidad.
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
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

  // 4) Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  } // Checar si el usuario a cambiado la contraseña.

  // GRANT ACCESS TO PROTECTED ROUTE.
  req.user = currentUser; // Llegara a este punto en caso de que todo sea correcto.
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user' // solo nos traera dos valores, los cuales se covierten en arreglo
    if (!roles.includes(req.user.role)) {
      return next(
        // En caso de que no se obtenga un roll, arrojamos un error.
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // In case you don't have an email of the user, return an error.
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // desactivara todos los validadores en nuestro Schemaa

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    //Protocol el http de la pagina
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot yout password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token) // lo actualizamos con el token
    .digest('hex'); // lo convertimos a hexadecimal

  // -- Cifrar el token y compararlo con el cifrado en la base de datos.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Verificamos si el token aun no ha caducado.
  }); //Encontrameos al usuario con el token

  // 2) If token has not expired, and there is user, set the new password
  // Buscaremos al usuario y si no lo encontramos retornaremos un error.
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //Guardamos de nuevacuenta el usuario.// Queremos confirmar que la confirmacion de password se iuales // Si a la validacion.

  // 3) Update changedPasswordAt property for the user.

  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
