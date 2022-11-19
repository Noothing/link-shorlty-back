module.exports = {
    apps: [
        {
            name: "[DEV] Shortly Backend",
            script: 'npm run start',
            watch: false,
            env: {
                DEBUG: false,
                PROXY: false,

                PORT: 32512,
                CLIENT: "http://shorlty.tech/",

                DB_HOST: "localhost",
                DB_PORT: 3306,
                DB_USERNAME: "shortly",
                DB_NAME: "shortly",
                DB_PASSWORD: "pP1E3D&1rlBA",
                DB_DIALECT: "mysql",

                JWT_ACCESS_SECRET: "86A3KSs9je76",
                JWT_ACCESS_EXPIRES: 900000,
                JWT_REFRESH_SECRET: "LcUC46G53Nav",
                JWT_REFRESH_EXPIRES: 2592000000,
            }
        }
    ]
};
