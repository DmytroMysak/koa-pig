export default (sequelize, DataTypes) => {
  const audioData = sequelize.define(
    'audioData',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
      },
      fileName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      voiceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('AWS', 'TELEGRAM', 'YOUTUBE'),
        allowNull: false,
        defaultValue: 'AWS',
      },
      fileId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'audioData',
      timestamps: false,
    },
  );
  audioData.associate = (models) => {
    audioData.belongsTo(models.voices, { foreignKey: 'voiceId' });
    // audioData.hasOne(models.chatData, { foreignKey: 'audioId' });
  };
  return audioData;
};
