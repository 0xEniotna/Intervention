const axios = require('axios');
require('dotenv').config();
const starknet = require('starknet');
const { addrToHex } = require('./utils.js');

const { JEDI_FACTORY_ABI } = require('./src/ABIs/jediswap/factory.js');
const { JEDI_PAIR_ABI } = require('./src/ABIs/jediswap/pair.js');
const { JEDI_FACTORY_ADDRESS } = require('./constants.js');

const db = require('./db.js');


const STARKNET_API_ENDPOINT = process.env.STARKNET_API_ENDPOINT;

async function getPendingTransactions() {
    try {
        const feederGatewayUrl = 'https://alpha-mainnet.starknet.io/feeder_gateway'

        // Construct the URL for fetching pending transactions
        const gatewayUrl = `${feederGatewayUrl}/get_block`;

        // Make a GET request to the feeder gateway
        const response = await axios.get(gatewayUrl);
        return response.data.transactions;
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        return null;
    }
}

async function monitorPendingTransactions() {
    while (true) {
        const pendingTransactions = await getPendingTransactions();
        console.log('Pending Transactions:', pendingTransactions);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking again
    }
}

async function getAllJediPairs(provider) {
    
    try {
        const factoryContract = new starknet.Contract(JEDI_FACTORY_ABI, JEDI_FACTORY_ADDRESS, provider);
        const pairAddresses = await factoryContract.get_all_pairs();
        return pairAddresses.all_pairs;
    } catch (error) {
        console.error('Error fetching all pairs:', error);
        return null;
    }
}

async function getTokensFromPairs(provider, pairs) {
    try {
        const tokenAddressesPromises = pairs.map(pair => getTokensFromPair(provider, addrToHex(pair)));
        return await Promise.all(tokenAddressesPromises);
    } catch (error) {
        console.error('Error fetching tokens from pairs:', error);
        return null;
    }
}

async function getTokensFromPair(provider, pair) {
    try {
        const pairContract = new starknet.Contract(JEDI_PAIR_ABI, pair, provider);
        console.log("pair: ", pairContract.address)
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();
        return [addrToHex(token0Address.address), addrToHex(token1Address.address)];
    } catch (error) {
        console.error('Error fetching all pairs:', error);
        return null;
    }
}

async function insertTokensFromPairInDB(provider, pair) {
    try {
        const pairContract = new starknet.Contract(JEDI_PAIR_ABI, pair, provider);
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();
        db.insertPair(addrToHex(token0Address.address), addrToHex(token1Address.address), pairContract.address);
    } catch (error) {
        console.error('Error fetching all pairs:', error);
        return null;
    }
}

async function insertAllPairsInDB(provider) {
    // Call the getAllJediPairs function
    const pairs = await getAllJediPairs(provider);
    const allTokens = await getTokensFromPairs(provider, pairs);
    console.log("Inseting tokens in DB...")
    try {
        await insertTokensFromPairInDB(provider, pairs)
    } catch (error) {
        console.error('Error inserting tokens', error);
        return null;
    }
}

async function main() {
    // Initialize the provider (adjust as per your StarkNet setup)
    const provider = new starknet.RpcProvider({ nodeUrl: STARKNET_API_ENDPOINT });

    await insertAllPairsInDB(provider);
    // if (allTokens) {
    //     console.log('Jedi Pairs:', allTokens);
    // }
}
 
// Execute the main function
// Execute the main function
main();

// getAllJediPairs();
