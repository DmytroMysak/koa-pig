export default (sequelize, DataTypes) => {
  const chatData = sequelize.define(
    'chatData',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      textHash: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      audioId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: 'chatData',
      timestamps: true,
      createdat: 'createdAt',
    },
  );
  chatData.associate = (models) => {
    chatData.belongsTo(models.users, { foreignKey: 'userId' });
    chatData.belongsTo(models.voices, { foreignKey: 'voiceId' });
    chatData.belongsTo(models.audioData, { as: 'audio', foreignKey: 'audioId' });
  };
  return chatData;
};
