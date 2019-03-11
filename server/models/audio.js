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
        validate: {
          len: {
            args: [1, 100],
            msg: 'file name should have from 1 to 100 symbols',
          },
          notEmpty: {
            msg: 'file name can\'t be empty',
          },
        },
      },
      voiceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('aws', 'telegram', 'youtube'),
        allowNull: false,
        defaultValue: 'aws',
        validate: {
          notEmpty: {
            msg: 'type can\'t be empty',
          },
          isIn: {
            args: ['aws', 'telegram', 'youtube'],
            msg: 'support only aws, telegram, youtube',
          },
        },
      },
    },
    {
      tableName: 'audio',
      timestamps: false,
    },
  );
  audio.associate = (models) => {
    audio.belongsTo(models.voices, { foreignKey: 'voiceId' });
  };
  return audio;
};
