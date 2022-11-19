const {validateAccessToken} = require("../utils/jwt");

module.exports = function (app) {
    const {user_token} = app.models

    this.checkUserAuth = async (req, res, next) => {
        const {_access_token} = req.cookies

        if (_access_token) {
            const info = await validateAccessToken(_access_token)
            console.log(info)
            if (info) {
                const exist = await user_token.findOne({
                    where: {
                        access_token: _access_token
                    }
                })
                console.log(exist)
                if (exist) {
                    req.user_id = info.user_id
                    next()
                } else {
                    next()
                }
            } else {
                next()
            }


        } else {
            next()
        }

    }

    return this

}