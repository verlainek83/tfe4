const config = require("../config/mysql.json");
const debug = require("debug")("placetopark:sequelize");
const { Sequelize, DataTypes, Model } = require("sequelize");


const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password, {
        logging: (msg) => debug(msg),
        dialect: "mysql",
        host: config.host,
        port: config.port,
    }
);

module.exports = sequelize;