const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
const Tarif = require("./tarif");
//Définition du modèle Adresse
class Trafic extends Model {
    get url() {
        return `/trafics/${this.id}`;
    }
}
//création de l'instance
Trafic.init({
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    nom:{type:DataTypes.STRING, allowNull: false },
    // moment:{type:DataTypes.STRING, allowfalse:false},
    managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "trafic",
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["nom", "moment"],
    // }],
});
// ,{ foreignKey: { name: 'fk_trafic' }},
Trafic.hasMany(Tarif, { foreignKey:'traficId', constraints: false, });
Tarif.belongsTo(Trafic, { as: 'trafic', foreignKey:'traficId', constraints: false, });

module.exports = Trafic;
