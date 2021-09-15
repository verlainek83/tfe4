// importation des differentes constantes à utiliser
const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const {DateTime} = require("luxon");
//Définition du modèle Adresse
class Reservation extends Model {
    //création de l'adresse virtuelle
    get url() {
        return `/reservations/${this.id}`;
    }
}
//création de l'instance du modèle
Reservation.init({
    // Definition des attributs
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true, unique: true,},
    codeReservation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false, unique: true, },
    dateReservation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW , allowNull: false },
    dateOccupation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW , allowNull: false},
    dateDepart: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW, allowNull: false  } ,
    heureArrivee: {
        type: DataTypes.TIME,
        defaultValue: '09:00', allowNull: false},
    heureDepart: {
        type: DataTypes.TIME,
        defaultValue: '10:00', allowNull: false
    },
    validationReservation: { type:DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    // managerOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: "reservation",
    //création de l'indexe qui sera également la clé primaire et l'id
    // indexes: [{
    //     unique: true,
    //     primaryKey: true,
    //     fields: ["codeReservation", "dateReservation"],
    // }, ],
    createdAt: false,
    updatedAt: false,
});
module.exports = Reservation;