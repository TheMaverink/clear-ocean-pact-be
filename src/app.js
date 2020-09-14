import '@babel/polyfill';
import 'module-alias/register';

import http from 'http';
import express from 'express';
import expressStatusMonitor from 'express-status-monitor';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './utils/logger';
import errorHandler from 'errorhandler';
const { check, validationResult } = require('express-validator');
import Routes from './routes';

dotenv.config({ path: '.env' });

const app = express();

const httpServer = http.Server(app);

let nodeEnv = process.env.NODE_ENV;
let mongoUri;

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

const corsOptions = {
  credentials: true,
};

switch (nodeEnv) {
  case 'development':
    mongoUri = process.env.DEV_MONGODB_URI;
    console.log(chalk.red(chalk.white.bgMagenta.bold('Development Mode')));
    break;

  case 'test':
    mongoUri = process.env.TEST_MONGODB_URI;
    console.log(chalk.red(chalk.white.bgMagenta.bold('Test Mode')));
    break;

  case 'production':
    mongoUri = process.env.DEV_MONGODB_URI;
    console.log(chalk.red(chalk.white.bgMagenta.bold('Production Mode')));
    break;
}

const connectDb = () => {
  return mongoose.connect(mongoUri);
};

// EXPRESS CONFIG
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.use(expressStatusMonitor());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(check());
app.use(cors(corsOptions));

app.get('/', (req, res, next) => res.send('API RUNNING'));

app.use('/api', Routes);

if (nodeEnv === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).send('Server Error');
  });
}

connectDb()
  .then(() => {
    if (nodeEnv !== 'test') {
      httpServer.listen(app.get('port'), () => {
        logger.info(
          '%s App is running at http://localhost:%d in %s mode',
          chalk.green('✓'),
          app.get('port'),
          app.get('env')
        );
        logger.info('🟢 Press CTRL-C to stop');
      });
    }
  })
  .catch((err) => {
    logger.error(err);
    logger.info(
      '%s MongoDB connection error. Please make sure MongoDB is running.',
      chalk.red('✗')
    );
    process.exit();
  });

module.exports = httpServer;
