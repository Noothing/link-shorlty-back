module.exports = function(app) {
    Object.keys(app.models).forEach(key => {
        app.system.sequelize.models[key].associate(app.models);
    });
}