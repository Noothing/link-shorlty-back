const {DataTypes, Model} = require("sequelize")
const {argon2i} = require("argon2-ffi");
const jwt = require('jsonwebtoken');


module.exports = (app) => {
    /**
     * Sequelize
     */
    const sequelize = app.system.sequelize

    /**
     * Models
     */
    class url_transitions extends Model {

    }

    /**
     * Init
     */
    url_transitions.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        url_id: {
            type: DataTypes.STRING
        },
        user_agent: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.INTEGER
        },
        platform: {
            type: DataTypes.STRING
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
        tableName: 'url_transitions',
        modelName: 'url_transitions',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    url_transitions.associate = (models) => {
        url_transitions.belongsTo(models.urls, {
            sourceKey: 'id',
            foreignKey: 'url_id'
        })

        url_transitions.belongsTo(models.city, {
            sourceKey: 'id',
            foreignKey: 'location'
        })
    }

    /**
     * Return
     */
    return url_transitions
}