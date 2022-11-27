const geoip = require("geoip-lite");
const {Sequelize} = require("sequelize");
const getUrlTitle = require("get-url-title")

/**
 * Dependence
 */
const
    env = require('dotenv').config().parsed


module.exports = (app) => {
    const {urls, url_transitions, city, country} = app.models
    const geoip = require('geoip-lite');

    const createLocation = async (location) => {
        const createCity = async (country) => {
            return await city.create({
                name: location.city,
                short: location.region,
                country_id: country.id,
                lat: location.ll[0],
                lon: location.ll[1],
            })
        }

        const createCountry = async () => {
            return await country.create({
                name: location.country,
                short: location.country
            })
        }

        const existCountry = await country.findOne({
            where: {
                short: location.country
            }
        })

        if (existCountry) {
            return await createCity(existCountry)
        } else {
            const country = await createCountry()
            return await createCity(country)
        }
    }

    const saveTransition = async (req, id) => {
        const main_info = {
            ip: req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress ||
                null,
            browser: req.useragent.browser,
            platform: req.useragent.platform,
        }

        const createTransition = async (city) => {
            await url_transitions.create({
                url_id: id,
                user_agent: main_info.browser,
                platform: main_info.platform,
                location: city.id
            })
        }

        const location = geoip.lookup(main_info.ip)
        const existCity = await city.findOne({
            where: {
                name: location.city
            }
        })

        if (existCity) {
            await createTransition(existCity)
        } else {
            const new_city = await createLocation(location)
            await createTransition(new_city)
        }
    }

    /**
     * Get
     *
     * @description
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    this.get = async (req, res, next) => {
        const {short_url} = req.params

        try {
            const url = await urls.findOne({
                where: {
                    id: short_url
                }
            })

            if (url) {
                await saveTransition(req, short_url)
                res.redirect(url.url)
            } else {
                res.redirect(env.CLIENT + '404')
            }
        } catch (e) {
            console.log(e)
            res
                .status(500)
                .send({
                    success: false,
                    error: 'Internal server error'
                })
        }
    }

    // Returns
    return this
}