const {DataTypes, Model} = require("sequelize")
const {argon2i} = require("argon2-ffi");
const jwt = require("jsonwebtoken")

module.exports = (app) => {
    /**
     * Sequelize
     */
    const sequelize = app.system.sequelize

    /**
     * Config
     */
    const jwt_config = app.config.jwt;


    /**
     * Models
     */
    class refresh_token extends Model {
        verifyRefreshToken(options = {}) {
            return jwt.verify(this.refresh_token, jwt_config.refresh_secret, options)
        }
    }

    /**
     * Init
     */
    refresh_token.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        refresh_token: {
            type: DataTypes.STRING
        },
        ip: {
            type: DataTypes.STRING,
        },
        browser: {
            type: DataTypes.STRING
        },
        expires_in: {
            type: DataTypes.STRING,
        },
        platform: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.INTEGER
        },
        date_added: {
            type: DataTypes.DATE
        },
        date_modified: {
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        timestamps: true,
        tableName: 'refresh_token',
        modelName: 'refresh_token',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    refresh_token.associate = (models) => {
        refresh_token.belongsTo(models.users, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        })

        refresh_token.belongsTo(models.city, {
            sourceKey: 'id',
            foreignKey: 'location'
        })
    }

    /**
     * Return
     */
    return refresh_token
}