module.exports = (app) => {
    /**
     * Express
     */
    const api = app.system.express.connection

    /**
     * Controllers
     */
    const {
        get
    } = app.controllers.urls

    /**
     * Routes
     */
    api.get('/:short_url', get)
}