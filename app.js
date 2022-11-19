/**
 * Dependence
 */
const
    chain = require('middleware-chain'),
    env = require('dotenv').config(),
    consign = require('consign'),
    path = require("path"),
    cron = require("node-cron");

/**
 * App
 */
const app = {};

/**
 * Autoload middleware
 */
consign({
    verbose: process.env.DEBUG == 'true',
})
    .include('config.js')
    .then('system/sequelize.js')
    .then('system/express.js')
    .then('models')
    .then('utils')
    .then('middleware/association.js')
    .then('middleware/authorization.js')
    .then('controllers')
    .then('cron')
    .then('system/run.js')
    .then('routes')
    .then('middleware/error.js')
    .into(app);

/**
 * Chain
 */
chain([
    app.system.bot,
    app.system.sequelize,
    app.middleware.association,
    app.system.run
]);
