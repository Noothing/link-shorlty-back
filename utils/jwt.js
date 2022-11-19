/**
 * Dependence
 */
const
    jwt = require('jsonwebtoken');

module.exports = function(app) {
    /**
     * generateTokens
     */
    this.generateTokens = (payload) => {
        const { access_secret, access_expires, refresh_secret, refresh_expires } = app.config.jwt;
        const access_token = jwt.sign(payload, access_secret, { expiresIn: access_expires });
        const refresh_token = jwt.sign(payload, refresh_secret, { expiresIn: refresh_expires });

        return {
            access_token,
            refresh_token,
            access_expires,
            refresh_expires,
        };
    }

    /**
     * validateAccessToken
     */
    this.validateAccessToken = async (token) => {
        const { access_secret } = app.config.jwt;

        if (!token) return null;

        try {
            const payload = jwt.verify(token, access_secret);

            return payload;
        } catch (e) {
            console.log(e)
            return null;
        }
    };

    /**
     * validateRefreshToken
     */
    this.validateRefreshToken = async (token) => {
        const { refresh_secret } = app.config.jwt;

        if(!token) return null;

        try {
            const payload = jwt.verify(token, refresh_secret);
            return payload;
        } catch (e) {
            return null;
        }
    }

    this.decodeToken = async (token) => {
        const decoded = await jwt.decode(token);

        return decoded;
    }

    /**
     * Returns
     */
    return this;
}
