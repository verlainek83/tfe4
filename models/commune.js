// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const Adresse = require("./adresse");
// Définition du modèle
class Commune extends Model {
    //création de l'adresse virtuelle 
    get url() {
        return `/communes/${this.id}`;
    }
}
//création de l'instance du modèle
Commune.init({
    // Definition des attributs 
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    //création du nom comme étant un string non null
    nom:{type:DataTypes.STRING, allowNull: false },
    //création du code postal comme étant un int non null
    codePostal:{ type:DataTypes.INTEGER(4), allowNull:false },
    // id_Adresse: DataTypes.INTEGER,
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "commune",
    //definition de l'index comme étant également la clé primaire, auto-incrémenté
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["nom"],
    // }],
    createdAt: false,
    updatedAt: false,
});
// création des associations entre les tables Adresse et Commune
//une commune a plusieurs adresse
Commune.hasMany(Adresse);
//une adresse correspond à une seule commune ,{ foreignKey: { name: 'fk_commune' }, as: 'CommuneAlias',},
Adresse.belongsTo(Commune);
//exportation du module
module.exports = Commune;
