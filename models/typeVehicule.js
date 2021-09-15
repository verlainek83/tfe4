const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Tarif = require("./tarif");
const Vehicule = require("./vehicule");

class TypeVehicule extends Model {
    get url() {
        return `/typeVehicules/${this.id}`;
    }
}

TypeVehicule.init({
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    nom:{type:DataTypes.STRING, allowNull: false },
    // managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "typeVehicule",
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["nom"],
    // }],
    createdAt: false,
    updatedAt: false,
});

TypeVehicule.hasMany(Vehicule);
Vehicule.belongsTo(TypeVehicule);

TypeVehicule.hasMany(Tarif);
Tarif.belongsTo(TypeVehicule);

module.exports = TypeVehicule;
