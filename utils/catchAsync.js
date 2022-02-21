// Creamos una funcion, que va a envolver a las otras funciones
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // cacturamos el error al devolver la promesa, y next envia el error.
    // next se se debolvera con el mismo parametro que colocamos.
  };
};
