import path from 'path'
import nodemailer from 'nodemailer';
import nodemailerMailgun from 'nodemailer-mailgun-transport';
// import hbs from 'nodemailer-handlebars';
import hbs from 'nodemailer-express-handlebars';

let nodeEnv = process.env.NODE_ENV;

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

let nodeMailerTransporter = nodemailer.createTransport(nodemailerMailgun(auth));

const viewPath = nodeEnv === 'development' ? './src/views/' : './dist/views/';

// const viewPath = path.join(__dirname, 'views/emails')

const handlebarOptions = {
  viewEngine: {
      // extName: ".hbs",
      // partialsDir: path.resolve('./src/views/mail'),
      defaultLayout: false,
  },
  viewPath: path.resolve('./'),
  // extName: ".hbs",
};

const newHandlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    // partialsDir: path.resolve(__dirname, "templateViews"),
    defaultLayout: false,
  },
  // viewPath: path.resolve(__dirname, "templateViews"),
  viewPath:viewPath,
  extName: ".handlebars",
};





// nodeMailerTransporter.use(
//   'compile',
//   hbs(newHandlebarOptions)
// );

export default nodeMailerTransporter;
