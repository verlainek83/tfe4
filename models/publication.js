// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
// Définition du modèle
class Publication extends Model {
    //création de l'adresse virtuelle
    get url() {
        return `/publications/${this.id}`;
    }
}
//création de l'instance du modèle
Publication.init({
    // Definition des attributs 
    description:{type:DataTypes.STRING, allowNull: false },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "publication",
    //definition de l'index comme étant également la clé primaire, auto-incrémenté
    indexes: [{
        // unique: true,
        primaryKey: true,
        fields: ["description"],
    }],
});
//exportation du module
module.exports = Publication;
