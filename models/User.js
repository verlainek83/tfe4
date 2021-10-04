const { Model, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const bcrypt = require("bcrypt");
const Publication = require("./publication");
const Parking = require("./parking");
const Reservation = require("./reservation");
const Location = require("./location");

class Permission extends Model {get url() {
    return `/permissions/${this.id}`;}
}
Permission.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true,},
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  { sequelize, modelName: "permission" ,
    createdAt: false,
    updatedAt: false,
  }
);

class Role extends Model {get url() {
    return `/roles/${this.id}`;}
}
Role.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true,},
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  { sequelize, modelName: "role" , 
    createdAt: false,
    updatedAt: false,}
);

Role.belongsToMany(Permission, { through: "role_permissions" });
Permission.belongsToMany(Role, { through: "role_permissions" });

class User extends Model {
  async validPassword(passwordToTest) {
    return bcrypt.compare(passwordToTest, this.passwordHash);
  }

  can(permissionName) {
    return this.roles.some((role) => {
      return role.permissions.some((perm) => {
        return perm.name === permissionName;
      });
    });
  }
}

User.init(
  { id: { type: DataTypes.INTEGER, autoIncrement:true, unique: true,},
    username: { type: DataTypes.STRING, primaryKey: true,},
    passwordHash: DataTypes.STRING,
    usermail: DataTypes.STRING,
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    telephone: DataTypes.STRING,
  },
  { sequelize, modelName: "user" ,
  // indexes: [{
  //   unique: true,
  //   fields: ["username"],
  // }], 
  createdAt: false,
  updatedAt: false,
}
);

User.belongsToMany(Role, { through: 'user_roles', foreignKey: 'userUsername'});
Role.belongsToMany(User, { through: 'user_roles', foreignKey: 'roleId'});

User.hasMany(Publication, {foreignKey: 'userId', sourceKey: 'id'});
Publication.belongsTo(User, {targetKey:'id', foreignKey: 'userId'});

User.hasMany(Parking, {foreignKey: 'userId', sourceKey: 'id'});
Parking.belongsTo(User, {targetKey:'id', foreignKey: 'userId'});

User.hasMany(Reservation, {foreignKey: 'userId', sourceKey: 'id'});
Reservation.belongsTo(User, {targetKey:'id', foreignKey: 'userId'});

User.hasMany(Location, {foreignKey: 'userId', sourceKey: 'id'});
Location.belongsTo(User, {targetKey:'id', foreignKey: 'userId'});

module.exports = { User, Role, Permission };
