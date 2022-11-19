/**
 * Dependence
 */
const
    Sequelize = require('sequelize');

module.exports = function(app) {
    /**
     * Init
     */
    const sequelize = new Sequelize(
        app.config.db.name,
        app.config.db.username,
        app.config.db.password,
        {
            host: app.config.db.host,
            port: app.config.db.port,
            dialect: app.config.db.dialect,
            logging: process.env.DEBUG == 'true'
        }
    );


    /**
     * Return
     */
    return sequelize;
}