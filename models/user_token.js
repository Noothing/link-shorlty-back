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
    class user_token extends Model {
        verifyAccessToken(options = {}) {
            return jwt.verify(this.access_token, jwt_config.access_secret, options)
        }
    }

    /**
     * Init
     */
    user_token.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        access_token: {
            type: DataTypes.STRING
        },
        expires_in: {
            type: DataTypes.STRING,
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
        tableName: 'user_token',
        modelName: 'user_token',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    user_token.associate = (models) => {
        user_token.belongsTo(models.users, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        })
    }

    /**
     * Return
     */
    return user_token
}