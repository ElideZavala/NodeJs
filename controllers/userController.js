const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // la llaves los selecionamos como objetos para recorrerla en un matriz.
    if (allowedFields.includes(el)) newObj[el] = obj[el]; //los elementos que incluya los convertimos en un objeto.
  });
  return newObj;
};

//exportacion de los controlers
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); // Esperamos la consulta para que pueda regresar con todos los documentos.

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. please use / updateMyPassword',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated //solo los que requerimos.
  const filterBody = filterObj(req.body, 'name', 'email'); // Del objeto req.body filtramos el nombre y el email

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Desactivar un Usuario
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null, // Ya no existen los datos.
  });

  next();
});

// Obtener un Usuario
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// Crear un Usuario
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// Eliminar al Usuario
exports.deleteUser = factory.deleteOne(User);
