const winston = require('winston');
const { config } = require('.');

const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    defaultMeta: { service: config.SERVICE_NAME },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, service, stack }) => {
            return `[${timestamp}] [${level}] [${service}]: ${stack || message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

module.exports = logger;
