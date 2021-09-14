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
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { sequelize, modelName: "permission" }
);

class Role extends Model {get url() {
    return `/roles/${this.id}`;}
}
Role.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { sequelize, modelName: "role" }
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
  { id_user: { type: DataTypes.INTEGER, autoIncrement:true, unique: true,},
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
}
);

User.belongsToMany(Role, { as: 'roles', through: 'user_roles', foreignKey: 'userUsername', otherKey: 'roleName'});
Role.belongsToMany(User, { as: 'users', through: 'user_roles', foreignKey: 'roleName', otherKey: 'userUsername'});

User.hasMany(Publication, { foreignKey:'userUsername'});
Publication.belongsTo(User, { as: 'use', foreignKey:'userUsername'});

User.hasMany(Parking, { foreignKey:'userUsername', constraints: false,});
Parking.belongsTo(User, { foreignKey:'userUsername', constraints: false,});

User.hasMany(Reservation, { foreignKey:'userUsername', constraints: false, });
Reservation.belongsTo(User, { as: 'user', foreignKey:'userUsername', constraints: false, });

User.hasMany(Location, { foreignKey:'userUsername', constraints: false, });
Location.belongsTo(User, { as: 'us', foreignKey:'userUsername', constraints: false, });

module.exports = { User, Role, Permission };
