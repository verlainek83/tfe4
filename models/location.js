// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Vehicule = require("./vehicule");
// Définition du modèle
class Location extends Model {
    //création de l'adresse virtuelle 
    get url() {
        return `/locations/${this.id}`;
    }
}
//création de l'instance du modèle
Location.init({
    // Definition des attributs 
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,}, 
    //création de la date de début comme étant de type Date non null
    date_Debut:{type:DataTypes.DATEONLY, defaultValue: DataTypes.NOW, allowNull: false },
    //création de la date de fin comme étant de type Date non null
    date_Fin:{type:DataTypes.DATEONLY, defaultValue: DataTypes.NOW, allowNull: false },
    //création de l'heure de début comme étant de type time non null
    heure_Debut:{type:DataTypes.TIME, defaultValue: '09:00', allowNull: false},                
    //création de l'heure de fin comme étant de type time non null
    heure_Fin:{type:DataTypes.TIME, defaultValue: '10:00', allowNull: false},
    validationLocation: { type:DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "location",
    //definition de l'indexe comme étant également la clé primaire, auto-incrémenté
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["date_Debut", "date_Fin"],
    // }],
    createdAt: false,
    updatedAt: false,
});
Location.hasMany(Vehicule);
//une location correspond à un seul vehicule 
Vehicule.belongsTo(Location);

//exportation du module
module.exports = Location;
