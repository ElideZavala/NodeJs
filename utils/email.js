const nodemailer = require('nodemailer');
const pug = require('pug');
// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Elide Zavala <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1;
    }
    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
      logger: true,
    });
  }

  send(template, subject) {
    // 1) Render HTML based on a pug template
    // Convertira el codigo pug en HTML real y la guardamos en una variable.
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`);

    // 2) Define email options
    const mailOptions = {
      from: 'Elide Zavala <admin@gmail.com>',
      to: options.email, // Correo al que lo vamos enviar.
      subject: options.subject, // Asunto
      text: options.message, // mensaje del correo electronico.
      // html:
    };

    // 3) Create a transport and send email.
  }

  sendWelcome() {
    this.send('welcome', 'Welcome to the Natours Family!');
  }
};

const sendEmail = async (options) => {
  // 2) Define the email options

  // 1) Actually send the email
  await transporter.sendMail(mailOptions); // Enviamos el Email.
};

module.exports = sendEmail;
