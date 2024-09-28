# Blockchain Balance Checker

This project is an advanced blockchain balance checker that scans multiple blockchains for token balances associated with Ethereum addresses. It's designed to efficiently process large numbers of addresses and store the results in a MySQL database.

## Features

- Scans multiple blockchains (Ethereum, Binance Smart Chain, Polygon, Fantom)
- Checks balances for native coins and top 20 tokens on each blockchain
- Stores results in a MySQL database
- Implements batch processing for efficient address scanning
- Includes error handling and logging
- Uses connection pooling for database operations
- Implements rate limiting for API calls

## Prerequisites

- Node.js (v14 or later)
- MySQL server
- API keys for CoinMarketCap, Etherscan, BSCscan, Polygonscan, and FTMscan

## Installation

1. Clone the repository:
   
   git clone https://github.com/SnotacusNexus/blockchain-balance-checker.git
   cd blockchain-balance-checker
   

2. Install dependencies:
   
   npm install
   

3. Set up your .env file with your database credentials and API keys:
   
   DB_HOST=localhost
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_PORT=3306
   DB_NAME=blockchain_balance_checker

   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   BSC_API_KEY=your_bscscan_api_key
   POLYGON_API_KEY=your_polygonscan_api_key
   FTM_API_KEY=your_ftmscan_api_key
   

4. Create the MySQL database:
   
   CREATE DATABASE blockchain_balance_checker
   CHARACTER SET utf8mb4
   COLLATE utf8mb4_general_ci;
   

## Usage

Run the application:


node index.js


The application will:
1. Create necessary database tables
2. Scan these addresses across multiple blockchains
3. Store any found balances in the database

## Configuration

You can modify the following in the config.js file:
- Batch size for processing
- API request delay
- Supported blockchains and their configurations

## Project Structure

- package.json: Defines project dependencies and scripts
- config.js: Manages configuration and environment variables
- database.js: Handles database operations
- blockchainScanner.js: Manages blockchain interactions and balance checking
- apiService.js: Handles API calls to external services
- index.js: Main application file that ties everything together
- .env: Contains environment variables (API keys, database credentials)

## Logging

Logs are stored in:
- error.log: For error-level logs
- combined.log: For all logs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

