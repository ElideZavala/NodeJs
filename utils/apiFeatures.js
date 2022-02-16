class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // desestruracion de los datos
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(req.query, queryObj); // Las peticiones que se realizaron en postman

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj); // Devolvera una consulta hecha en nuestro postman
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // hacer concidir con estas palabras (g)= sucedera varias veces. remplazara a estos valors solo para que tengan el signo $, ejemplp ($gte)

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr)); // Convertira lo que estamos buscando en un JSON para el queryy
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('');
      console.log(sortBy);
      this.query = this.query.sort(sortBy); // Realizamos este tipo de orden "127.0.0.1:3000/api/v1/tours?sort=price"
      // sort('price ratingsAverage'); // Ordenar por dos formas en mongoose
      // Ordenar de mayor a menor 127.0.0.1:3000/api/v1/tours?sort=-price
    } else {
      this.query = this.query.sort('-createdAt'); // ordenar dependiendo los elementos creado
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // Seleccionamos estos campos
    } else {
      this.query = this.query.select('-__v'); // Excluimos este campo utilizando el signo (-) => (Para no mostrar al cliente)
    } // el _id simpre sera visible
    // Igual se pueden hacer exclusiones usando el signo (-) en el query de nuestra pagina o de query
    // Field puede ser muy util cuando tenemos datos muy sesibles que no deberia usarse internamente como contraseñas que nunca deben de exponerse al publico.
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // convertimos la cadena a numero y por defecto tendremos la num. 1;
    const limit = this.queryString.limit * 1 || 100; // Valor por defecto sera 100
    const skip = (page - 1) * limit; // Todos los resultados que vienen.

    this.query = this.query.skip(skip).limit(limit); // Salto de pagina y su limite de elementos. tendremos 10 paginas de 10 elementos.

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments(); // Contara la cantidad de elementos que existen.
    //   if (skip >= numTours) throw new Error('This page does not exist'); // si skip es mayor a esa cantidad dara error.
    // }

    return this;
  }
}
module.exports = APIFeatures;
