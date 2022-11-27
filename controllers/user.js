const crypto = require("crypto"),
    {argon2i} = require("argon2-ffi"),
    Promise = require("bluebird"),
    randomBytes = Promise.promisify(crypto.randomBytes),
    {Op} = require("sequelize");
const {validateAccessToken, validateRefreshToken} = require("../utils/jwt");
const e = require("express");

module.exports = (app) => {
    const jwt_config = app.config.jwt;
    const {users, user_token, refresh_token} = app.models

    this.registration = async (req, res, next) => {
        const {email, username, password, firstname, lastname} = req.body
        try {
            let salt = await randomBytes(32)
            let encrypted_password = await argon2i.hash(password, salt)

            const user = await users.create({
                email,
                username,
                password: encrypted_password,
                firstname,
                lastname
            })

            const access = await user_token.create({
                user_id: user.id,
                access_token: user.getAccessToken(),
                expires_in: Math.round((+Date.now() + +jwt_config.access_expires) / 1000)
            })

            const refresh = await refresh_token.create({
                user_id: user.id,
                refresh_token: user.getRefreshToken(),
                ip: req.headers['x-forwarded-for'] ||
                    req.socket.remoteAddress ||
                    null,
                browser: req.useragent.browser,
                platform: req.useragent.platform,
                expires_in: Math.round((+Date.now() + +jwt_config.refresh_expires) / 1000)
            })

            return res
                .status(200)
                .cookie('_access_token', access.access_token, {maxAge: jwt_config.access_expires, httpOnly: true})
                .cookie('_refresh_token', refresh.refresh_token, {maxAge: jwt_config.refresh_expires, httpOnly: true})
                .send({
                    success: true,
                    data: {
                        email: user.email,
                        username: user.username,
                        fullName: user.fullName,
                    }
                })
        } catch (e) {
            console.warn("[REGISTRATION]", e)
            res
                .status(500)
                .send({
                    success: false,
                    error: 'Internal server error'
                });
        }
    }

    this.authorization = async (req, res, next) => {
        const {username, email, password} = req.body
        try {
            if ((username || email) && password) {
                const user = await users.findOne({
                    where: {
                        ...(username ? {username: username} : {email: email})
                    }
                })

                if (user) {
                    const verify = await user.verifyPassword(password)

                    if (verify) {
                        const refresh = await refresh_token.create({
                            user_id: user.id,
                            refresh_token: user.getRefreshToken(),
                            ip: req.headers['x-forwarded-for'] ||
                                req.socket.remoteAddress ||
                                null,
                            browser: req.useragent.browser,
                            platform: req.useragent.platform,
                            expires_in: Math.round((+Date.now() + +jwt_config.refresh_expires) / 1000)
                        })

                        res.cookie('_refresh_token', refresh.refresh_token, {
                            maxAge: jwt_config.refresh_expires,
                            httpOnly: true
                        })

                        const access = await user_token.create({
                            user_id: user.id,
                            access_token: user.getAccessToken(),
                            expires_in: Math.round((+Date.now() + +jwt_config.access_expires) / 1000)
                        })
                        res.cookie('_access_token', access.access_token, {
                            maxAge: jwt_config.access_expires,
                            httpOnly: true
                        })

                        res
                            .status(200)
                            .send({
                                success: true,
                                data: {
                                    username: user.username,
                                    firstname: user.firstname,
                                    lastname: user.lastname,
                                    email: user.email
                                }
                            })
                    } else {
                        res
                            .status(403)
                            .send({
                                success: false,
                                error: 'Invalid username or password'
                            })
                    }
                } else {
                    res
                        .status(403)
                        .send({
                            success: false,
                            error: 'Invalid username or password'
                        })
                }
            } else {
                res
                    .status(400)
                    .send({
                        success: false,
                        error: 'Invalid input data'
                    })
            }

        } catch (e) {
            console.log("[Authorization]", e)
            res
                .status(500)
                .send({
                    success: false,
                    error: "Internal server error"
                })
        }
    }

    this.refresh = async (req, res, next) => {
        const {_access_token, _refresh_token} = req.cookies
        if (_access_token) {
            const token = await user_token.findOne({
                where: {
                    access_token: _access_token
                },
                include: [users, {
                    model: users
                }]
            })

            if (token) {
                const exist = await validateAccessToken(_access_token)
                if (exist) {
                    req.user_id = exist.user_id

                    res
                        .status(200)
                        .send({
                            success: true,
                            data: {
                                info: {
                                    expire_at: exist.exp,
                                    user_id: exist.user_id
                                },
                                user: {
                                    email: token.user.email,
                                    username: token.user.username,
                                    firstname: token.user.firstname,
                                    lastname: token.user.lastname
                                }
                            }
                        })

                } else {
                    token.destroy()

                    if (_refresh_token) {
                        const token = await refresh_token.findOne({
                            where: {
                                refresh_token: _refresh_token
                            },
                            include: [users, {
                                model: users
                            }]
                        })

                        if (token) {
                            const exist = await validateRefreshToken(_refresh_token)
                            if (exist) {
                                const user = await users.findOne({
                                    where: {
                                        id: exist.user_id
                                    }
                                })

                                const access = await user_token.create({
                                    user_id: user.id,
                                    access_token: user.getAccessToken(),
                                    expires_in: Math.round((+Date.now() + +jwt_config.access_expires) / 1000)
                                })
                                res.cookie('_access_token', access.access_token, {
                                    maxAge: jwt_config.access_expires,
                                    httpOnly: true
                                })

                                req.user_id = exist.user_id

                                res
                                    .status(200)
                                    .send({
                                        success: true,
                                        data: {
                                            info: {
                                                expire_at: exist.exp,
                                                user_id: exist.user_id
                                            },
                                            user: {
                                                email: token.user.email,
                                                username: token.user.username,
                                                firstname: token.user.firstname,
                                                lastname: token.user.lastname
                                            }
                                        }
                                    })
                            } else {
                                res
                                    .clearCookie("_refresh_token")
                                    .clearCookie("_access_token")
                                    .status(200)
                                    .send({
                                        success: false,
                                    })
                            }
                        } else {
                            res
                                .clearCookie("_refresh_token")
                                .clearCookie("_access_token")
                                .status(200)
                                .send({
                                    success: false,
                                })
                        }
                    } else {
                        res
                            .clearCookie("_refresh_token")
                            .clearCookie("_access_token")
                            .status(200)
                            .send({
                                success: false,
                            })
                    }
                }
            } else {
                console.log('no token')
                res
                    .status(401)
                    .send({
                        success: false,
                        error: {
                            text: 'Bad request'
                        }
                    })
            }

        } else {
            res
                .status(403)
                .send({
                    success: false,
                    error: {
                        text: 'Don\'t authed'
                    }
                })
        }
    }

    this.existUsername = async (req, res, next) => {
        const {username} = req.query

        if (username) {

            const exist = await users.findOne({
                where: {
                    username: username
                }
            })

            res
                .status(200)
                .send({
                    success: true,
                    data: {
                        exist: Boolean(exist)
                    }
                })

        } else {
            res
                .status(401)
                .send({
                    success: false,
                    error: {
                        text: 'Not all params exist',
                        errored: [
                            'username'
                        ]
                    }
                })
        }
    }

    this.logout = async (req, res, next) => {
        res
            .clearCookie('_access_token')
            .status(200)
            .send({
                success: true
            })
    }

    return this
}