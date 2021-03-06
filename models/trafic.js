const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Tarif = require("./tarif");
const PlageHoraire = require("./plageHoraire.js");
//Définition du modèle Adresse
class Trafic extends Model {
    get url() {
        return `/trafics/${this.id}`;
    }
}
//création de l'instance
Trafic.init({
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    nom:{type:DataTypes.STRING, allowNull: false },
    // moment:{type:DataTypes.STRING, allowfalse:false},
    // managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "trafic",
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["nom", "moment"],
    // }],
    createdAt: false,
    updatedAt: false,
});
// ,{ foreignKey: { name: 'fk_trafic' }},
Trafic.hasMany(Tarif);
Tarif.belongsTo(Trafic);
Trafic.hasMany(PlageHoraire);
PlageHoraire.belongsTo(Trafic);

module.exports = Trafic;
