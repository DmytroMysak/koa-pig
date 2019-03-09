export default (sequelize, DataTypes) => {
  return sequelize.define(
    'client',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
      },
      accessKey: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'client',
      timestamps: false,
    },
  );
};
