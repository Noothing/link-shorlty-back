module.exports = function(app) {
    const
        { express, sequelize } = app.system;


    /**
     * DB
     */
    try {
        sequelize.sync();

        console.log('[SEQULIZE] Success sync!');
    } catch (e) {
        console.error(e);
    }


    /**
     * Bot
     */
    try {
        express.listen();

        console.log('[EXPRESS] Success launch server!');
    } catch (e) {
        console.error(e);
    }
}