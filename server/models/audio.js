export default (sequelize, DataTypes) => {
  const audio = sequelize.define(
    'audio',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
      },
      fileName: {
        type: DataTypes.STRING(100),
        unique: true,
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
    },
    {
      tableName: 'audio',
      timestamps: false,
    },
  );
  audio.associate = (models) => {
    audio.belongsTo(models.voices, { foreignKey: 'voiceId' });
    // audio.hasOne(models.messages, { foreignKey: 'audioId' });
  };
  return audio;
};
