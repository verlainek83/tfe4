// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Trafic= require("./trafic");
//Définition du modèle
class PlageHoraire extends Model {
    //création de l'adresse virtuelle
    get url() {
        return `/plageHoraires/${this.id}`;
    }
}
//création de l'instance du modèle
PlageHoraire.init({
   // Definition des attributs 
   id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    //création de la date de début comme étant de type Date non null
    heureDebut:{type:DataTypes.TIME, allowNull: false },
    heureFin:{type:DataTypes.TIME, allowNull: false },
    // managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "plageHoraire",
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["heureDebut", "heureFin"],
    // }],
    createdAt: false,
    updatedAt: false,
});
PlageHoraire.hasMany(Trafic, { foreignKey:'plageHoraireId', constraints: false, });
Trafic.belongsTo(PlageHoraire, { as: 'plageH', foreignKey:'plageHoraireId', constraints: false, });

module.exports = PlageHoraire;
