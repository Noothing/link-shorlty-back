/**
 * Dependence
*/
const
    express = require('express'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    cookieParser = require("cookie-parser"),
    path = require("path"),
    cors = require("cors"),
    useragent = require("express-useragent");

module.exports = function(app) {
    /**
     * Init
    */
    const api = express();

    /**
     * Set View Engine
    */
    api.set("views", path.join(__dirname, "..", "views"));
    api.set("view engine", "ejs");

    /**
     * Security
    */
    api.use(
        cors({
            origin: app.config.client,
            credentials: true,
        })
    );

    /**
     * Cookie
    */
    api.use(cookieParser());

    /**
     * Body Parser
     */
    api.use(bodyParser.json());

    /**
     * File Upload
     */
    api.use(fileUpload());

    /**
     * User agent
     */
    api.use(useragent.express());

    /**
     * Connection
    */
    this.connection = api;

    /**
     * Start Connection
    */
    this.listen = () => {
        return api.listen(app.config.port, () => {
            console.log(`[EXPRESS] App listening on ${app.config.port}`);
        });
    }

	/**
     * Return
    */
	return this;
}