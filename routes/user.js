module.exports = (app) => {
    /**
     * Express
     */
    const api = app.system.express.connection

    /**
     * Controllers
     */
    const {
        registration,
        authorization,
        refresh,
        existUsername,
        logout
    } = app.controllers.user
    const {get} = app.controllers.urls

    const {checkUserAuth} = app.middleware.authorization

    /**
     * Routes
     */
    api.post('/user/registration', registration)
    api.post('/user/auth', authorization)
    api.get('/user/logout', logout)
    api.get('/user/refresh', refresh)
    api.get('/user/exist', existUsername)
}