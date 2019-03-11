export default (sequelize, DataTypes) => {
  const messages = sequelize.define(
    'messages',
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
        validate: {
          notEmpty: {
            msg: 'text can\'t be empty',
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      audioId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: 'messages',
      timestamps: true,
      createdat: 'createdAt',
    },
  );
  messages.associate = (models) => {
    messages.belongsTo(models.users, { foreignKey: 'userId' });
    messages.belongsTo(models.voices, { foreignKey: 'voiceId' });
    messages.belongsTo(models.audio, { foreignKey: 'audioId' });
  };
  return messages;
};
