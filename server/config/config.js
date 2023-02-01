require("dotenv").config();
const fs = require("fs");

module.exports = {
    development: {
        username: "root",
        password: "MySQLpassword123###",
        database: "breaddit",
        host: "localhost",
        dialect: "mysql",
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST_URL,
        dialect: process.env.DATABASE_DIALECT,
    },
};
