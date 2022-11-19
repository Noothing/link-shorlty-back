const geoip = require("geoip-lite");
const {Sequelize} = require("sequelize");
const getUrlTitle = require("get-url-title")
const sequelize = require("sequelize");

/**
 * Dependence
 */
const
    env = require('dotenv').config().parsed


module.exports = (app) => {
    const {urls, url_transitions, city, country} = app.models
    const geoip = require('geoip-lite');


    /**
     * Is Valid URL
     *
     * @description Method for validating url. Returns false if URL is invalid or has 'http' protocol
     *
     * @param string
     * @returns {boolean}
     */
    const isValidUrl = (string) => {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

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
     * Create Short Url
     *
     * @description Method creating row in DataBase. After creating row to database it generates short url.
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    this.createShortUrl = async (req, res, next) => {
        const {url} = req.body
        const user_id = req?.user_id ?? null
        console.log(req.body)
        try {
            if (url) {
                if (isValidUrl(url)) {
                    const generated = await urls.create({
                        url: url,
                        user_id: user_id,
                        title: 'New url',
                    })

                    res
                        .status(200)
                        .send({
                            success: true,
                            data: {
                                'short_url': generated.short_url
                            }
                        })
                } else {
                    res
                        .status(401)
                        .send({
                            'success': false,
                            'error': 'URL is invalid or has HTTP protocol'
                        })
                }
            } else {
                res
                    .status(401)
                    .send({
                        'success': false,
                        'error': 'URL is required'
                    })
            }
        } catch (e) {
            console.warn('[CREATE SHORT URL]', e)

            res.status(500)
                .send({
                    'success': false,
                    'error': 'Internal server error'
                })
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

    this.getAll = async (req, res, next) => {
        const user_id = req.user_id

        if (user_id) {
            const user_urls = await urls.findAll({
                where: {
                    user_id: user_id
                },
                include: [{
                    model: url_transitions, attributes: []
                }],
                attributes: [
                    'id', 'url', 'title', [Sequelize.fn("COUNT", Sequelize.col("url_transitions.url_id")), "transitions"], 'date_added'
                ],
                group: ['urls.id'],
                order: [['date_added', 'DESC']]
            })

            res
                .status(200)
                .send({
                    success: true,
                    data: {
                        urls: user_urls
                    }
                })

        } else {
            res
                .status(403)
                .send({
                    success: false,
                    error: {
                        text: 'No information founded for this user'
                    }
                })
        }
    }

    this.getStatistic = async (req, res, next) => {
        const {url_id} = req.params
        const user_id = req.user_id

        try {
            const url = await urls.findOne({
                where: {
                    user_id: user_id,
                    id: url_id
                },
                attributes: [
                    'id', 'url', 'date_added'
                ],
                include: [{
                    model: url_transitions,
                    attributes: [
                        'user_agent',
                        'platform',
                        'date_added',
                        [sequelize.fn('DATE', sequelize.col('date_added')), 'Date']
                    ],
                    group: [sequelize.fn('DATE', sequelize.col('date_added')), 'Date'],
                    include: [{
                        model: city,
                        attributes: [
                            'name',
                            'short',
                            'lat',
                            'lon'
                        ],
                        include: [{
                            model: country,
                            attributes: [
                                'name',
                                'short'
                            ]
                        }]
                    }]
                }]
            })

            res
                .send({
                    data: {
                        url
                    }
                })

        } catch (e) {
            console.warn('[GET STATISTIC]', e)

            res.status(500)
                .send({
                    'success': false,
                    'error': 'Internal server error'
                })
        }
    }

    // Returns
    return this
}