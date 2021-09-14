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
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
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
  createdAt: false,
  updatedAt: false,
}
);

User.belongsToMany(Role, { through: 'user_roles'});
Role.belongsToMany(User, { through: 'user_roles'});

User.hasMany(Publication);
Publication.belongsTo(User);

User.hasMany(Parking);
Parking.belongsTo(User);

User.hasMany(Reservation);
Reservation.belongsTo(User);

User.hasMany(Location);
Location.belongsTo(User);

module.exports = { User, Role, Permission };
