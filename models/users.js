const {DataTypes, Model} = require("sequelize")
const {argon2i} = require("argon2-ffi");
const jwt = require('jsonwebtoken');


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
    class users extends Model {
        verifyPassword(password) {
            return argon2i.verify(this.password, password)
        }

        getAccessToken() {
            return jwt.sign(
                {
                    user_id: this.id
                },
                jwt_config.access_secret,
                {
                    expiresIn: jwt_config.access_expires
                }
            )
        }

        getRefreshToken() {
            return jwt.sign(
                {
                    user_id: this.id
                },
                jwt_config.refresh_secret,
                {
                    expiresIn: jwt_config.refresh_expires
                }
            )
        }
    }

    /**
     * Init
     */
    users.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value) {
                const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                if (regex.test(value)) this.setDataValue('email', value)
                else throw new Error("Email is invalid")
            }
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            set(value) {
                this.setDataValue('username', value ? value.toLowerCase() : null)
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING
        },
        lastname: {
            type: DataTypes.STRING
        },
        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstname} ${this.lastname}`;
            },
            set(value) {
                throw new Error('Do not try to set the `fullName` value!');
            }
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
        tableName: 'users',
        modelName: 'users',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    users.associate = (models) => {
        users.hasMany(models.user_token, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        })

        users.hasMany(models.urls, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        })
    }

    /**
     * Return
     */
    return users
}