const {DataTypes, Model} = require("sequelize")


module.exports = (app) => {
    /**
     * Sequelize
     */
    const sequelize = app.system.sequelize

    /**
     * Models
     */
    class country extends Model {

    }

    /**
     * Init
     */
    country.init({
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
        date_added: {
            type: DataTypes.DATE
        },
        date_modified: {
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        timestamps: true,
        tableName: 'country',
        modelName: 'country',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    country.associate = (models) => {
        country.hasMany(models.city, {
            sourceKey: 'id',
            foreignKey: 'country_id'
        })
    }

    /**
     * Return
     */
    return country
}