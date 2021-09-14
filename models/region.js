// importation des differentes constantes à utliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Commune = require("./commune");
// creation du modèle region
class Region extends Model {
    get url() {
        return `/regions/${this.id}`;
    }
}
// definition de l'instance du modèle Region
Region.init({
    id: {type: DataTypes.INTEGER, unique: true, autoIncrement: true},
    nom:{type:DataTypes.STRING, primaryKey:true, },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "region",
    // indexes: [{
    //     unique: true,
    //     // primaryKey: true,
    //     fields: ["nom"],
    // }],
    createdAt: false,
    updatedAt: false,
});
// création des associations entre les tables region et commune
Region.hasMany(Commune);
Commune.belongsTo(Region);
//exportation du module
module.exports = Region;