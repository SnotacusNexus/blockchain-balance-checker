const axios = require('axios');
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTop20TokensForBlockchain(blockchain) {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      params: {
        start: 1,
        limit: 20,
        convert: 'USD',
        cryptocurrency_type: 'tokens',
        sort: 'market_cap',
        sort_dir: 'desc',
        aux: 'platform',
        platform_id: blockchain.cmcId
      },
      headers: {
        'X-CMC_PRO_API_KEY': config.apiKeys.coinMarketCap
      }
    });

    await sleep(config.apiRequestDelay); // Rate limiting

    return response.data.data.map(token => ({
      name: token.name,
      contractAddress: token.platform.token_address,
    }));
  } catch (error) {
    logger.error('Error fetching top 20 tokens', { error: error.message, blockchain: blockchain.name });
    return [];
  }
}

module.exports = {
  getTop20TokensForBlockchain
};
