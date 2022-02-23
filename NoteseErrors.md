**EXECTIONES**
- Todos los Errores o bugs que ocurren en nuestro codigo asyncrono pero que no son detectadas. 
___
```JavaScript
process.on('uncaughtException', (err) => {
  console.log('UNHANDLER REJECTION! 🎃🕯 Shutting down...');
  console.log(err); // Registramos todos los errores en la consola.
  server.close(() => {
    // Cerrara el servidor y ejecutara los siguiente.
    process.exit(1); // Apagar el Servidor.
  });
});
___
