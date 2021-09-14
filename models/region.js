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
    idRegion: {type: DataTypes.INTEGER, unique: true, autoIncrement: true},
    nom:{type:DataTypes.STRING, primaryKey:true, },
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "region",
    indexes: [{
        unique: true,
        // primaryKey: true,
        fields: ["nom"],
    }],
});
// création des associations entre les tables region et commune
Region.hasMany(Commune, { foreignKey:'regionNom', sourceKey:'nom'});
Commune.belongsTo(Region, { as: 'region', foreignKey:'regionNom', targetKey:'nom'});
//exportation du module
module.exports = Region;