export default (sequelize, DataTypes) => {
  const usersClients = sequelize.define(
    'usersClients',
    {
      clientId: {
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
      tableName: 'usersClients',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['clientId', 'userId'],
        },
      ],
    },
  );
  return usersClients;
};
