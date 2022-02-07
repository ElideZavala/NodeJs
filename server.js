const app = require('./app');

console.log(process.env);

// SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
