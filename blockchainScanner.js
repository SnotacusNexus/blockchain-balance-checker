const axios = require('axios');
const ethers = require('ethers');
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

async function checkBalance(address, blockchain) {
    try {

        const response = await axios.get(`${blockchain.apiUrl}?module=account&action=balance&address=${address}&tag=latest&apiKey=${blockchain.apiKey}`);
        // console.log(`${blockchain.apiUrl}?module=account&action=balance&address=${address}&tag=latest&apiKey=${blockchain.apiKey}`);
        if (response.data.status === '1') {
            return BigInt(response.data.result);
        } else {
            console.warn('API returned unsuccessful status', { blockchain: blockchain.name, blockchainApiKey: blockchain.apiKey, address: address, status: response.data.status, message: response.data.message });
            return BigInt(0);
        }
    } catch (error) {
        console.error('Error checking balance', { error: error.message, blockchain: blockchain.name, address });
        return BigInt(0);
    }
}

async function checkTokenBalance(address, contractAddress, blockchain) {
    try {

        const response = await axios.get(`${blockchain.apiUrl}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${blockchain.apiKey}`);

        if (response.data.status === '1') {
            return BigInt(response.data.result);
        } else {
            console.warn('API returned unsuccessful status for token balance', { blockchain: blockchain.name, address, contractAddress, status: response.data.status, message: response.data.message });
            return BigInt(0);
        }
    } catch (error) {
        console.error('Error checking token balance', { error: error.message, blockchain: blockchain.name, address, contractAddress });
        return BigInt(0);
    }
}

async function scanAddress(address, privateKey) {
    const results = [];

    for (const blockchain of[...config.blockchains]) {
        const balance = await checkBalance(address, blockchain);
        if (balance > BigInt(0)) {
            results.push({
                pubAddress: address,
                privateKey,
                balance: balance.toString(),
                blockchain: blockchain.name,
                tokenName: 'Native',
                contractAddress: null
            });
        }

        // Here you would add logic to check token balances
        // This would involve getting a list of top tokens for the blockchain
        // and then checking the balance for each token
    }

    return results;
}

module.exports = {
    scanAddress
};