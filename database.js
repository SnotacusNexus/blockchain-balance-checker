const mysql = require('mysql2/promise');
const config = require('./config');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

const pool = mysql.createPool({

    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.name,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error', { error: error.message, sql, params });
        throw error;
    }
}

async function createTables() {
    try {
        await query(`CREATE TABLE IF NOT EXISTS randomAddresses(Id INT AUTO_INCREMENT PRIMARY KEY,pubAddress VARCHAR(42) UNIQUE, privateKey VARCHAR(64))`);

        await query(`
            CREATE TABLE IF NOT EXISTS status(pubAddress VARCHAR(42) PRIMARY KEY)`);

        await query(`
            CREATE TABLE IF NOT EXISTS balances(pubAddress VARCHAR(42),privateKey VARCHAR(64),balance DECIMAL(65, 0),blockchain VARCHAR(20),tokenName VARCHAR(50),
                contractAddress VARCHAR(42),PRIMARY KEY(pubAddress, blockchain, tokenName))
            `);

        console.info('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables', { error: error.message });
        throw error;
    }
}

module.exports = {
    query,
    createTables
};