const fs = require('fs'); // Accedo al modelo de sistemas de archivo, para leer el archivo Json
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // IMPORTAMOS dotenv PARA PODER USARLO.
const Tour = require('../../models/tourModel'); // Importamos el modelo
const Review = require('../../models/reviewModel'); // Importamos el modelo
const User = require('../../models/userModel'); // Importamos el modelo

dotenv.config({ path: './config.env' }); // CONFIGURAMOS LA UBICACION DEL ARCHIVO CONFIG.

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Methodo of connection.
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  // Conectarnos a la base de datos
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')); // Leemos el archivo
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')); // Leemos el archivo
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
); // Leemos el archivo

// IMPORT DATA INTO DB // Nuestros datos van a ser creados en la base de datos de Mongoose
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION // Eliminamos toda nuestra collection en Mongoose.
const deleteData = async () => {
  try {
    await Tour.deleteMany(); // Usada para elimnar muchos elementos
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Nuevos datos, perimero eliminamos y luego importamos los nuevos valores.
if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv); // Importacion de guiones
