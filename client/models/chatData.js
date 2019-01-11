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
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()'),
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      voiceId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'voices',
          key: 'id',
        },
      },
      audioId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'audioData',
          key: 'id',
        },
      },
    },
    {
      tableName: 'chatData',
      timestamps: false,
    },
  );
  chatData.associate = (models) => {
    chatData.belongsTo(models.users, { foreignKey: 'userId' });
    chatData.belongsTo(models.voices, { foreignKey: 'voiceId' });
    chatData.belongsTo(models.audioData, { as: 'audio', foreignKey: 'audioId' });
  };
  return chatData;
};
