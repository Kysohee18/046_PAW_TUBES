'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const pg = require('pg');
require('dotenv').config();

const basename = path.basename(__filename);

function getCleanUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const cleaned = urlStr.trim().replace(/^["']|["']$/g, '');
  if (!cleaned || cleaned === 'null' || cleaned === 'undefined') return null;
  return cleaned;
}

let connectionUrl = getCleanUrl(process.env.DATABASE_URL) 
  || getCleanUrl(process.env.POSTGRES_URL) 
  || getCleanUrl(process.env.POSTGRES_PRISMA_URL) 
  || getCleanUrl(process.env.POSTGRES_URL_NON_POOLING);

let sequelize;

if (connectionUrl && (connectionUrl.startsWith('postgres://') || connectionUrl.startsWith('postgresql://'))) {
  try {
    const parsedUrl = new URL(connectionUrl);
    parsedUrl.searchParams.delete('sslmode');
    parsedUrl.searchParams.delete('ssl');
    connectionUrl = parsedUrl.toString();
  } catch (err) {
    // Ignore URL parse error
  }

  sequelize = new Sequelize(connectionUrl, {
    dialect: "postgres",
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'development' ? false : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // SQLite In-Memory fallback for zero-config offline testing
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
}

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
