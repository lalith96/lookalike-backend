const winston = require('winston');

const customLevels = {error: 0,warn: 1,info: 2,http: 3,verbose: 4,debug: 5};

winston.addColors({
error: 'red',
  warn: 'yellow',
  info: 'green',
  verbose: 'cyan',
  debug: 'blue',
});

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.json() 
);


const fileTransport = new winston.transports.File({
  filename: 'doppularLogger.log',
  format: logFormat,
  level:'debug'
});

// Create the logger instance
const logger = winston.createLogger({
  levels: customLevels, 
  format: logFormat,
  transports: [
    fileTransport
  ],
});


// logger.info('Application started');
// logger.warn('Warning: Something unexpected happened');
// logger.error('Error: Failed to connect to database', { error: 'Database connection error' });
// logger.debug('Debugging information', { someData: 'value' });
// logger.http('HTTP request', { method: 'GET', url: '/api/users' });

module.exports = logger;