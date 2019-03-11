export default (sequelize, DataTypes) => {
  const roles = sequelize.define(
    'roles',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'roles',
      timestamps: false,
    },
  );
  roles.associate = (models) => {
    roles.belongsToMany(models.users, { through: 'usersRoles', foreignKey: 'roleId' });
  };
  return roles;
};
