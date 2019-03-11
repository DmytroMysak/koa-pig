export default (sequelize, DataTypes) => {
  const clients = sequelize.define(
    'clients',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      accessKey: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: {
            args: [1, 50],
            msg: 'access key should have from 1 to 50 symbols',
          },
          notEmpty: {
            msg: 'access key can\'t be empty',
          },
        },
      },
      type: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
        validate: {
          notEmpty: {
            msg: 'type can\'t be empty',
          },
          isIn: {
            args: ['public', 'telegram', 'youtube'],
            msg: 'support only public or private',
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'clients',
      timestamps: false,
    },
  );
  clients.associate = (models) => {
    clients.belongsToMany(models.users, { through: 'usersClients', foreignKey: 'clientId' });
  };
  return clients;
};
