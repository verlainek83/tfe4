// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Parking = require("./parking");
const {User} = require("./User");
//Définition du modèle Adresse
class Adresse extends Model {
    //création de l'adresse virtuelle 
    get url() {
        return `/adresses/${this.id}`;
    }
}
//création de l'instance du modèle Adresse
Adresse.init({
    // Definition des attributs 
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    //création du nom comme étant un string non null
    nom:{type:DataTypes.STRING },
    //création du numero comme étant un int non null
    numero:{type:DataTypes.INTEGER(4)},
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "adresse",
    //création de l'indexe qui sera également la clé primaire et l'id
    // indexes: [{
    //     unique: true,
    //     // primaryKey: true,
    //     fields: ["nom"],
    // }],
});
// création des associations entre les tables Adresse et Parking, 
// et entre les tables Adresse et User(nommée Utilisateur dans le diagramme de classe)
//une Adresse a plusieurs parkings
Adresse.hasMany(Parking, { foreignKey:'adresseId', constraints: false, });
//un parking crrespond à une seule adresse 
Parking.belongsTo(Adresse, { as:'adresse', foreignKey:'adresseId', constraints: false, });
//une adresse a plusieurs Users
Adresse.hasMany(User, { foreignKey:'adresseId', constraints: false, });
//un User correspond à une seule adresse 
User.belongsTo(Adresse, { as:'adresse', foreignKey:'adresseId', constraints: false, });
// exportation du module
module.exports = Adresse;