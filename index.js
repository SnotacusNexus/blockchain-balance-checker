const ethers = require('ethers');
const config = require('./config');
const database = require('./database');
const blockchainScanner = require('./blockchainScanner');
const apiService = require('./apiService');
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

async function generateAndSaveAddresses(count) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        addresses.push({
            pubAddress: wallet.address,
            privateKey: wallet.privateKey.slice(2) // Remove '0x' prefix
        });
    }

    const insertQuery = 'INSERT IGNORE INTO randomAddresses (pubAddress, privateKey) VALUES ?';
    const values = addresses.map(addr => [addr.pubAddress, addr.privateKey]);

    try {
        await database.query(insertQuery, [values]);
        console.log(`Generated and saved {count} addresses`, { count: count });
    } catch (error) {
        console.error('Error saving addresses', { error: error.message });
    }
}
async function isPubAddressInStatus(pubAddress) {
    //let the database lookup the address for us
    // console.log('Checking status table for address:', pubAddress);
    const result = await database.query(`SELECT * FROM status WHERE pubAddress = UNHEX(${pubAddress})`).length > 0 ? true : false;
    //  console.log('Result:', result);

    return result;
}

async function processAddresses() {
    const batchSize = config.batchSize;
    let offset = 0;
    const oneDay = 1000 * 60 * 60 * 24;
    //set the end time
    let endTime = Date.now() + oneDay;
    // create a call counter variable
    let callCounter = 0;

    while (true) {
        const selectQuery = 'SELECT pubAddress, privateKey FROM randomAddresses WHERE pubAddress NOT IN (SELECT pubAddress FROM status) LIMIT ? OFFSET ?';
        const addresses = await database.query(selectQuery, [batchSize, offset]);

        if (addresses.length === 0) break;

        logger.info(`Processing {addresses.length} addresses`, { addresses: addresses.length });
        let lasttime = Date.now();

        for (const address of addresses) {
            try {

                if (await isPubAddressInStatus(address.pubAddress)) {
                    console.log(`Skipping address: {address.pubAddress}`, { address: address.pubAddress });
                    continue;
                }
                const results = await blockchainScanner.scanAddress(address.pubAddress, address.privateKey);

                if (results.length > 0) {
                    const insertQuery = 'INSERT INTO balances (pubAddress, privateKey, balance, blockchain, tokenName, contractAddress) VALUES ?';
                    const values = results.map(r => [r.pubAddress, r.privateKey, r.balance, r.blockchain, r.tokenName, r.contractAddress]);
                    await database.query(insertQuery, [values]);
                }

                await database.query('INSERT INTO status (pubAddress) VALUES (?)', [address.pubAddress]);
                console.log(`Processed address: {address.pubAddress}`, { address: address.pubAddress });

                const now = Date.now();
                const elapsed = now - lasttime;
                if (elapsed < config.apiRequestDelay) {
                    const sleepTime = config.apiRequestDelay - elapsed;
                    console.log('Sleeping for {sleepTime} ms', { sleepTime: sleepTime });
                    await new Promise(resolve => setTimeout(resolve, sleepTime));
                }
                callCounter++;
                lasttime = now;
                if (callCounter > 100000 && now > endTime) {
                    //sleep for the rest of time  until endTime
                    const sleepTime = endTime - now;
                    console.log('Sleeping for {sleepTime} ms', { sleepTime: sleepTime });
                    await new Promise(resolve => setTimeout(resolve, sleepTime));
                    callCounter = 0;
                    //reset the time
                    now = Date.now();
                    //set the end time
                    endTime = now + oneDay;

                }
            } catch (error) {
                console.error('Error processing address', { error: error.message, address: address.pubAddress });
            }
        }

        offset += batchSize;
    }
}

async function main() {
    try {
        await database.createTables();
        //await generateAndSaveAddresses(10000); // Generate 10,000 addresses
        await processAddresses();
        console.log('Processing completed');
    } catch (error) {
        console.error('Main process error', { error: error.message });
    }
}

main();