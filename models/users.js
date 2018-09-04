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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
