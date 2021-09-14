// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Reservation = require("./reservation");
const Location = require("./location");
// Définition du modèle
class Vehicule extends Model {
    //création de l'adresse virtuelle 
    get url() {
        return `/vehicules/${this.id}`;
    }
}
//création de l'instance du modèle
Vehicule.init({
    // Definition des attributs
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,}, 
    //création du numero de matricule de la voiture comme etant un string non null
    numero_immatriculation:{type:DataTypes.STRING, allowNull: false },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "vehicule",
     //definition de l'indexe comme étant également la clé primaire, auto-incrémenté
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["numero_immatriculation"],
    // }],
});
// création des associations entre les tables 
//un vehicule a plusieurs locations
Vehicule.hasMany(Location, { foreignKey:'vehiculeId', constraints: false, });
//une location correspond à un seul vehicule 
Location.belongsTo(Vehicule, { as: 'vehicule', foreignKey:'vehiculeId', constraints: false, });
//un vehicule a plusieurs reservations
Vehicule.hasMany(Reservation, { foreignKey:'vehiculeId', constraints: false, });
//une reservation correspond à un seul vehicule
Reservation.belongsTo(Vehicule, { as: 'vehicule', foreignKey:'vehiculeId', constraints: false, });
//exportation du module
module.exports = Vehicule;
