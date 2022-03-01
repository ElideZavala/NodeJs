const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
    logger: true,
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Elide Zavala <admin@gmail.com>',
    to: options.email, // Correo al que lo vamos enviar.
    subject: options.subject, // Asunto
    text: options.message, // mensaje del correo electronico.
    // html:
  };

  // 1) Actually send the email
  await transporter.sendMail(mailOptions); // Enviamos el Email.
};

module.exports = sendEmail;
