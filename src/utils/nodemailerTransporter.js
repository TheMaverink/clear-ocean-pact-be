import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import nodemailerMailgun from 'nodemailer-mailgun-transport';

dotenv.config({ path: '.env' });

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

let nodeMailerTransporter = nodemailer.createTransport(nodemailerMailgun(auth));

export default nodeMailerTransporter;


// var mailgun = require('mailgun-js')({
//   apiKey: process.env.MAILGUN_API_KEY,
//   domain: process.env.MAILGUN_DOMAIN,
// });
