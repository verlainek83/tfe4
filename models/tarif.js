// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Parking = require("./parking");
// Définition du modèle
class Tarif extends Model {
    //création de l'adresse virtuelle
    get url() {
        return `/tarifs/${this.id}`;
    }
}
//création de l'instance du modèle
Tarif.init({
    // Definition des attributs 
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    //création du montant comme étant un float non null
    montant:{type:DataTypes.FLOAT(5,2), allowNull: false },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "tarif",
    //definition de l'index comme étant également la clé primaire, auto-incrémenté
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["montant"],
    // }],
});
//un tarif appartient à un seul parking ,
// Tarif.hasMany(Parking);
// Parking.belongsTo(Tarif);


//exportation du module
module.exports = Tarif;