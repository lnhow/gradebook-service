const express = require('express');
const helmet = require("helmet");
const config = require('config');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const http = require('http');
const logger = require('./utils/logger');
const { acceptDomain } = require('../config/default');
const debug = require('debug')('project:server');
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
});

const app = express();
app.use(helmet());
require('./utils/passport.utils')(app);

const { port, version, env } = config.get('api');

let _port = process.env.PORT || port;
function logErrors(err, req, res, next) {
  logger.error(err);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something went wrong.' });
  } else {
    next(err);
  }
}

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


app.use(morgan('combined'))

const corsOptions = {
	origin: acceptDomain,
};
app.use(cors());
app.use(bodyParser.json());
app.use(logErrors);
app.use(clientErrorHandler);

// Routes
/* Split BackEnd & FrontEnd */
require('./routes')(app, version);
/* End Split */

app.get('/', (req, res) => {
  res.send('This is service of gradebook. Today is ' + new Date());
});

// app.listen(port);
logger.info(`Server start listening port: ${port}`);

app.use(bodyParser.json({
  extended: true,
  limit: '10mb',
}));
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var server = http.createServer(app);
server.listen(_port);
server.on('error', onError);
server.on('listening', onListening);
