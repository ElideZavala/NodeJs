const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  // req, campo y la devolucion de llamada.
  destination: (req, file, cb) => {
    cb(null, 'public/img/users'); // 1- Error si hay uno, 2- Destino real.
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]; // Seleccionamos el segundo elemento.
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
}); // Almacenamiento de multer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('No an image! Please upload only images', 400), false); // mandamos un mensaje de error y no abra almacenamiento.
  }
};

// Opciones para multer, Especificamos el destino de imagenes.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Incluimos que tenga solo una foto y luego lo exportamos.
exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // la llaves los selecionamos como objetos para recorrerla en un matriz.
    if (allowedFields.includes(el)) newObj[el] = obj[el]; //los elementos que incluya los convertimos en un objeto.
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

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

// Crear un Usuario
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

// Get All Users
exports.getAllUsers = factory.getAll(User);
// Obtener un Usuario
exports.getUser = factory.getOne(User);
// Actualizamos al Usuario. Do NOT update with this!
exports.updateUser = factory.updateOne(User);
// Eliminar al Usuario.
exports.deleteUser = factory.deleteOne(User);
