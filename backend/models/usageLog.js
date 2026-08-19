'use strict';

module.exports = (sequelize, DataTypes) => {
  const UsageLog = sequelize.define('UsageLog', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    api_key_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    response_time: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'usage_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  UsageLog.associate = (models) => {
    UsageLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UsageLog.belongsTo(models.ApiKey, {
      foreignKey: 'api_key_id',
      as: 'apiKey'
    });
  };

  return UsageLog;
};
