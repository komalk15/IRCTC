
const cors = require('cors');
const { config } = require('../config');

const origins = (config.ALLOWED_ORIGIN || '*')
    .split(',')
    .map(origin => origin.trim());

const corsMiddleware = cors({
    origin: origins.length === 1 && origins[0] === '*' ? '*' : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ]
});

module.exports = { corsMiddleware };
