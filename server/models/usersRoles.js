export default (sequelize, DataTypes) => {
  const usersRoles = sequelize.define(
    'usersRoles',
    {
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      tableName: 'usersRoles',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['roleId', 'userId'],
        },
      ],
    },
  );
  return usersRoles;
};
