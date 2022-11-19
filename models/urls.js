const {DataTypes, Model} = require("sequelize")

module.exports = (app) => {
    /**
     * Sequelize
     */
    const sequelize = app.system.sequelize

    /**
     * Models
     */
    class urls extends Model {
        // declare all characters
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        // program to generate random strings
        generateString(length) {
            let result = ' ';
            const charactersLength = this.characters.length;
            for (let i = 0; i < length; i++) {
                result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }
    }

    /**
     * Init
     */
    urls.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        url: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        short_url: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.id}`.replace(' ', '');
            },
            set(value) {
                throw new Error('Do not try to set the `short_url` value!');
            }
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
        tableName: 'urls',
        modelName: 'urls',
        createdAt: 'date_added',
        updatedAt: 'date_modified'
    })

    /**
     * Associate
     */
    urls.associate = (models) => {
        urls.belongsTo(models.users, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        })

        urls.hasMany(models.url_transitions, {
            sourceKey: 'id',
            foreignKey: 'url_id'
        })
    }

    /**
     * Hooks
     */
    urls.beforeCreate(async (url) => {
        let uniq
        let exist

        do {
            uniq = url.generateString(6)
            exist = await app.models.urls.findOne({
                where: {
                    id: uniq
                }
            })
        } while (exist);

        url.id = uniq.trim()
    })

    /**
     * Return
     */
    return urls
}