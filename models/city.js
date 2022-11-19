const {DataTypes, Model} = require("sequelize")

module.exports = (app) => {
    /**
     * Sequelize
     */
    const sequelize = app.system.sequelize

    /**
     * Models
     */
    class city extends Model {

    }

    /**
     * Init
     */
    city.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        short: {
            type: DataTypes.STRING
        },
        country_id: {
            type: DataTypes.INTEGER
        },
        lat: {
            type: DataTypes.STRING
        },
        lon: {
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
        tableName: 'city',
        modelName: 'city',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    city.associate = (models) => {
        city.hasMany(models.url_transitions, {
            sourceKey: 'id',
            foreignKey: 'location'
        })

        city.hasMany(models.refresh_token, {
            sourceKey: 'id',
            foreignKey: 'location'
        })

        city.belongsTo(models.country, {
            sourceKey: 'id',
            foreignKey: 'country_id'
        })
    }

    /**
     * Return
     */
    return city
}