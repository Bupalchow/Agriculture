const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

let dbConfig;

// For Railway deployment, use internal URL; for local migration, use public URL
const isRunningOnRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
const isLocalMigration = process.argv.includes('migrate.js');

if (process.env.MYSQL_URL && !isLocalMigration) {
    // Use internal connection for Railway deployment
    dbConfig = process.env.MYSQL_URL;
    console.log('Using MYSQL_URL (internal) connection');
} else if (process.env.MYSQL_PUBLIC_URL && isLocalMigration) {
    // Use public connection for local migration
    dbConfig = process.env.MYSQL_PUBLIC_URL;
    console.log('Using MYSQL_PUBLIC_URL (public) connection for migration');
} else {
    // Fallback to individual variables
    const host = isLocalMigration && process.env.MYSQL_PUBLIC_URL 
        ? 'switchyard.proxy.rlwy.net'
        : (process.env.MYSQLHOST || 'localhost');
    
    const port = isLocalMigration && process.env.MYSQL_PUBLIC_URL 
        ? 40174  // Extract from your MYSQL_PUBLIC_URL
        : (parseInt(process.env.MYSQLPORT) || 3306);

    dbConfig = {
        host: host,
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
        port: port,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        ssl: {
            rejectUnauthorized: false
        }
    };
    
    console.log('Using individual database variables:', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
    });
}

const pool = mysql.createPool(dbConfig);
const db = pool.promise();

module.exports = db;