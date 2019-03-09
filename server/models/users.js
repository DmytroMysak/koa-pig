export default (sequelize, DataTypes) => {
  const users = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
      },
      facebookId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      telegramId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      selectedVoiceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      volume: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1,
        isInt: {
          msg: 'voice level bad value, expected number between -1 and 10000',
        },
        min: {
          args: [-1],
          msg: 'voice level can\'t be less than -1',
        },
        max: {
          args: [10000],
          msg: 'voice level can\'t be more than 10000',
        },
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
      },
    },
    {
      tableName: 'users',
      timestamps: false,
    },
  );
  users.associate = (models) => {
    users.hasMany(models.chatData, { foreignKey: 'userId' });
    users.belongsTo(models.voices, { foreignKey: 'selectedVoiceId' });
  };
  return users;
};
