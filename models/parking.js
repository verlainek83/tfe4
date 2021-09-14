// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const Place = require("./place");
const Tarif = require("./tarif");
//Définition du modèle Parking
class Parking extends Model {
  get url() {
    return `/parkings/${this.id}`;
  }
}
//Création de l'instance du modèle Parking
Parking.init(
  {
    // Definition des attributs 
    //création du nombre de places comme étant un int non null
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    nombrePlaces: { type:DataTypes.INTEGER },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "parking",
    //definition de l'index comme étant également la clé primaire, auto-incrémenté
    // indexes: [
    //   {
    //     unique: true,
    //     // primaryKey: true,
    //     fields: ["nombrePlaces"],
    //   },
    // ],
    createdAt: false,
    updatedAt: false,
  }
);
// création des associations entre les tables 
//un parking a plusieurs tarifs
// Parking.hasMany(Tarif, { foreignKey:'parkingId', constraints: false, });
Parking.hasMany(Tarif);
// //un tarif appartient à un seul parking ,
// // Tarif.belongsTo(Parking, { as: 'parkin', foreignKey:'parkingId', constraints: false, });
Tarif.belongsTo(Parking);
// //un parking a plusieurs places
Parking.hasMany(Place);
// Parking.hasMany(Place);
// //une place appartient à un seul parking
Place.belongsTo(Parking);
// Place.belongsTo(Parking);

// Tarif.hasMany(Parking);
// Parking.belongsTo(Tarif);

//exportation du module
module.exports = Parking;
