"use strict";
const nodeMailer = require("nodemailer");
const dotEnv = require('dotenv');
dotEnv.config();


exports.SendEmail = function (somefield) {
  main(somefield)
    .catch(console.error);
};

async function main(somefield) {
  console.log('Executing mail send');
  let transporter = nodeMailer.createTransport({
    host: String(process.env.EMAIL_HOST), // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: Number(process.env.EMAIL_PORT), // port for secure SMTP
    tls: {
      ciphers: 'SSLv3'
    },
    auth: {
      user: String(process.env.EMAIL_USER),
      pass: String(process.env.EMAIL_PASSWORD)
    }
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fund-Bot" <' + String(process.env.EMAIL_USER) + '>', // sender address
    to: process.env.EMAIL_TO_ADDRESS,
    subject: '', // Subject line
    text: '', // plain text body
    // html: "<b>Hello world?</b>" // html body
  });
  console.log("Message sent: %s", info.messageId);
}
