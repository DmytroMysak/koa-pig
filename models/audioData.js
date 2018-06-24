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
      pathToFile: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      voiceId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: sequelize.literal('now()'),
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