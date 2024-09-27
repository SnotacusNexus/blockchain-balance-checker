require('dotenv').config();

module.exports = {
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME
    },
    apiKeys: {
        coinMarketCap: process.env.COINMARKETCAP_API_KEY,
        etherscan: process.env.ETHERSCAN_API_KEY,
        bscscan: process.env.BSC_API_KEY,
        polygonscan: process.env.POLYGON_API_KEY,
        ftmscan: process.env.FTM_API_KEY
    },
    blockchains: [
        { name: 'Ethereum', apiUrl: 'https://api.etherscan.io/api', cmcId: 1027, apiKey: process.env.ETHERSCAN_API_KEY },
        { name: 'BSC', apiUrl: 'https://api.bscscan.com/api', cmcId: 1839, apiKey: process.env.BSC_API_KEY },
        { name: 'Polygon', apiUrl: 'https://api.polygonscan.com/api', cmcId: 3890, apiKey: process.env.POLYGON_API_KEY },
        { name: 'Fantom', apiUrl: 'https://api.ftmscan.com/api', cmcId: 3513, apiKey: process.env.FTM_API_KEY }
    ],
    batchSize: 1000,
    apiRequestDelay: 200
};