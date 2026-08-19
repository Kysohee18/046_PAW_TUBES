'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductAnalysis = sequelize.define('ProductAnalysis', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    positive_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    negative_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    neutral_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    average_csat: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    flaws_detected: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    feature_csat: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    ai_action_items: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'product_analyses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ProductAnalysis;
};
