/**
 * Dependence
 */
const
    { parsed: env } = require('dotenv').config();

/**
 * Config
 */
module.exports = {
    port: env.PORT,
    client: env.CLIENT,
    db: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        name: env.DB_NAME,
        password: env.DB_PASSWORD,
        dialect: env.DB_DIALECT
    },
    auth: {
        client_id: env.AUTH_CLIENT_ID,
        client_secret: env.AUTH_CLIENT_SECRET,
        redirect: env.AUTH_REDIRECT
    },
    jwt: {
        access_secret: env.JWT_ACCESS_SECRET,
        access_expires: env.JWT_ACCESS_EXPIRES,
        refresh_secret: env.JWT_REFRESH_SECRET,
        refresh_expires: env.JWT_REFRESH_EXPIRES
    }
}
