export default (sequelize, DataTypes) => {
  const voices = sequelize.define(
    'voices',
    {
      id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      gender: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      languageCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      languageName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: 'voices',
      timestamps: false,
    },
  );
  voices.associate = (models) => {
    voices.hasMany(models.chatData, { foreignKey: 'voiceId' });
    voices.hasMany(models.audioData, { foreignKey: 'voiceId' });
    voices.hasOne(models.users, { foreignKey: 'selectedVoiceId' });
  };
  return voices;
};
