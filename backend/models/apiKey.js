'use strict';

module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key_prefix: {
      type: DataTypes.STRING,
      allowNull: false
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_used: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'api_keys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    ApiKey.hasMany(models.UsageLog, {
      foreignKey: 'api_key_id',
      as: 'usageLogs',
      onDelete: 'CASCADE'
    });
  };

  return ApiKey;
};
