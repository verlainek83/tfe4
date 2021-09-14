// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Location = require("./location");
const Reservation = require("./reservation");
const TypeVehicule = require("./typeVehicule");
//Définition du modèle
class Place extends Model {
    //création de l'adresse virtuelle
    get url() {
        return `/places/${this.id}`;
    }
}
//création de l'instance du modèle 
Place.init({
    //définition des attributs
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    //création de l'attribut description comme étant un string non null
    description: { type:DataTypes.STRING, allowNull: false},
    //création de l'attribut dimension comme étant un string non null
    dimension: { type:DataTypes.STRING, allowNull: false },
    // photo:DataTypes.BLOB,
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "place",
     //definition de l'index comme étant également la clé primaire, auto-incrémenté
    // indexes: [{
    //     unique: true,
    //     fields: ["description"],
    // }],
    createdAt: false,
    updatedAt: false,
});
// création des associations entre les tables 
//une place a plusieurs locations
Place.hasMany(Location);
//une location correspond à une seule place 
Location.belongsTo(Place);
//une place a plusieurs réservations
Place.hasMany(Reservation);
//une réservation correspond à une seule place
Reservation.belongsTo(Place);
//une place a plusieurs types de vehicule
Place.belongsToMany(TypeVehicule, { through: "place_typeVehicules"});
//un type de vehicule a plusieurs places
TypeVehicule.belongsToMany(Place, { through: "place_typeVehicules"});
//exportation du module
module.exports = Place;
