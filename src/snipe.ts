import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import * as figlet from 'figlet';
import chalk from 'chalk';

import * as starknet from 'starknet';
import { addrToHex } from './utils';

import { JEDI_FACTORY_ABI } from './ABIs/jediswap/factory';
import { JEDI_PAIR_ABI } from './ABIs/jediswap/pair';
import { JEDI_ROUTER_ABI } from './ABIs/jediswap/router';

import * as cnst from './constants';
import { ERC20_ABI } from './ABIs/token/erc20';

const STARKNET_API_ENDPOINT = process.env.STARKNET_API_ENDPOINT;
const TESTNET_GOERLI_ENDPOINT = process.env.TESTNET_GOERLI_ENDPOINT;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS as string;

export type SnipeConfig = {
  network: string;
  token: string;
  jedi_factory_address: string;
  jedi_router_address: string;
  account_address: string;
  private_key: string;
  amount: starknet.Uint256;
};

export async function getPairFromToken(
  provider: starknet.RpcProvider,
  config: SnipeConfig
): Promise<any | null> {
  try {
    const factoryContract: starknet.Contract = new starknet.Contract(
      JEDI_FACTORY_ABI,
      config.jedi_factory_address,
      provider
    );
    let factoryContractTyped = factoryContract.typed(JEDI_FACTORY_ABI);

    const pair = await factoryContractTyped.get_pair(
      config.token,
      cnst.ETH_ADDRESS
    );
    return pair;
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function getTokensFromPair(
  provider: starknet.RpcProvider,
  pairAddr: string
): Promise<any | null> {
  try {
    const pairContract: starknet.Contract = new starknet.Contract(
      JEDI_PAIR_ABI,
      pairAddr,
      provider
    );
    let pairContractTyped = pairContract.typed(JEDI_PAIR_ABI);

    const token0 = await pairContractTyped.token0();
    const token1 = await pairContractTyped.token1();

    return { token0: token0, token1: token1 };
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function getPairCreatedEvents(
  provider: starknet.RpcProvider,
  block: number,
  config: SnipeConfig
) {
  try {
    const keyFilter = [
      '0x19437bf1c5c394fc8509a2e38c9c72c152df0bac8be777d4fc8f959ac817189', // PairCreated
      '0x0',
    ];

    const eventsRes: any = await provider.getEvents({
      from_block: {
        block_number: block,
      },
      to_block: {
        block_number: block,
      },
      address: config.jedi_factory_address,
      keys: [keyFilter],
      chunk_size: 10,
    });
    return eventsRes.events;
  } catch (error) {
    console.error('Error fetching pair:', error);
    return null;
  }
}

export async function getLatestIncludedBlockWrapper(
  provider: starknet.RpcProvider
) {
  try {
    const block = await provider.getBlockLatestAccepted();
    return block.block_number;
  } catch (error) {
    console.error('Error fetching block:', error);
    return null;
  }
}

export async function getBlockWrapper(
  provider: starknet.RpcProvider,
  blockNumber: number
) {
  try {
    const block = await provider.getBlockWithTxs(blockNumber);
    return block;
  } catch (error) {
    console.error('Error fetching block:', error);
    return null;
  }
}

export async function monitorEvents(
  provider: starknet.RpcProvider,
  config: SnipeConfig
) {
  let lastProcessedBlock: number | null = null;
  let attemptCount = 0;
  let currentBlock;
  console.log('\n');

  while (true) {
    console.log(`Attempt ${++attemptCount}: Checking for new block...`);

    try {
      currentBlock = await getLatestIncludedBlockWrapper(provider);
      if (currentBlock === lastProcessedBlock) {
        console.log('No new block yet. Waiting...');
        await delay(10000); // Wait before checking again
        continue;
      }
    } catch (error) {
      console.error('Error getting latest block:', error);
      await delay(5000);
      continue;
    }

    console.log(`New block found: ${currentBlock}. Checking for events...`);
    lastProcessedBlock = currentBlock; // Update the last processed block

    try {
      const events = await getPairCreatedEvents(
        provider,
        currentBlock as number,
        config
      );
      if (events && events.length > 0) {
        console.log('Events found, looking for the pool...');
        const foundPool = findPoolInEvents(events, config.token);
        if (foundPool !== undefined) {
          console.log(chalk.red.bold('Pool found!'));
          return foundPool;
        } else {
          console.log('Pool not found. Waiting for next block...');
        }
      } else {
        console.log('No events found in block', currentBlock);
      }
    } catch (error) {
      console.error('Error getting events for block', currentBlock, ':', error);
    }
  }
}

export function findPoolInEvents(
  events: Array<any>, // Consider defining a more specific type for events
  address: string
): any | undefined {
  // The return type is the type of your event or undefined if not found
  // Find an event where data[0] or data[1] matches the address
  console.log('data 0', starknet.addAddressPadding(events[0].data[0]));
  console.log('data 1', starknet.addAddressPadding(events[0].data[1]));
  console.log('address', address);
  const matchingEvent = events.find(
    (event) =>
      (starknet.addAddressPadding(event.data[0]) === address &&
        starknet.addAddressPadding(event.data[1]) ===
          cnst.ETH_ADDRESS.toLowerCase()) ||
      (starknet.addAddressPadding(event.data[1]) === address &&
        starknet.addAddressPadding(event.data[0]) ===
          cnst.ETH_ADDRESS.toLowerCase())
  );
  if (!matchingEvent) {
    return undefined;
  } else {
    return matchingEvent.data[2]; //pair address
  }
}

export async function getAmountOutWrapper(
  provider: starknet.RpcProvider,
  path: Array<any>,
  config: SnipeConfig
) {
  const routerContract: starknet.Contract = new starknet.Contract(
    JEDI_ROUTER_ABI,
    config.jedi_router_address,
    provider
  );
  let routerContractTyped = routerContract.typed(JEDI_ROUTER_ABI);
  try {
    let amountOut = await routerContractTyped.get_amounts_out(
      config.amount,
      path
    );
    return amountOut['amounts'][1];
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function getReserves(
  provider: starknet.RpcProvider,
  pairAddr: string
): Promise<any | null> {
  const pairContract: starknet.Contract = new starknet.Contract(
    JEDI_PAIR_ABI,
    pairAddr,
    provider
  );
  let pairContractTyped = pairContract.typed(JEDI_PAIR_ABI);
  try {
    let res = await pairContractTyped.get_reserves();
    return res;
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function assertLiquidity(
  provider: starknet.RpcProvider,
  pairAddr: string
): Promise<boolean | null> {
  const pairContract: starknet.Contract = new starknet.Contract(
    JEDI_PAIR_ABI,
    pairAddr,
    provider
  );
  let pairContractTyped = pairContract.typed(JEDI_PAIR_ABI);
  try {
    let res = await pairContractTyped.get_reserves();
    if (res.reserve0.low > 0 && res.reserve1.low > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return false;
  }
}

export async function buybuy(
  provider: starknet.RpcProvider,
  config: SnipeConfig
) {
  const routerContract: starknet.Contract = new starknet.Contract(
    JEDI_ROUTER_ABI,
    config.jedi_router_address,
    provider
  );
  let account = new starknet.Account(
    provider,
    config.account_address,
    config.private_key,
    '1'
  );
  const eth: starknet.Contract = new starknet.Contract(
    ERC20_ABI,
    cnst.ETH_ADDRESS,
    provider
  );

  try {
    let path = [cnst.ETH_ADDRESS, config.token];
    let amountOut = await getAmountOutWrapper(provider, path, config);

    const unixTimestampNow = Math.floor(Date.now() / 1000);

    const multiCall = await account.execute([
      {
        contractAddress: eth.address,
        entrypoint: 'approve',
        calldata: starknet.CallData.compile({
          spender: routerContract.address,
          amount: config.amount,
        }),
      },
      {
        contractAddress: routerContract.address,
        entrypoint: 'swap_exact_tokens_for_tokens',
        calldata: starknet.CallData.compile({
          amountIn: config.amount,
          amountOutMin: amountOut,
          path: path,
          to: starknet.cairo.felt(account.address),
          deadline: starknet.cairo.felt(unixTimestampNow + 1000),
        }),
      },
    ]);

    let response = await provider.waitForTransaction(
      multiCall.transaction_hash
    );
    console.log('✅ Transaction hash =', response.transaction_hash);
  } catch (error) {
    console.error('Error swaping tokens', error);
    return null;
  }
}

// Helper function for delaying execution
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startApplication(
  network: string,
  tokenAddr: string,
  ethAmount: number
) {
  let endpoint =
    network == 'mainnet' ? STARKNET_API_ENDPOINT : TESTNET_GOERLI_ENDPOINT;
  let config = buildConfig(network, tokenAddr, ethAmount);
  let am = (config.amount.low.valueOf() as number) * 10 ** -18;
  console.log(`\nETH TO SPEND > ${am} ETH`);
  console.log('\nToken to snipe > ', config.token);
  console.log('\nAccount > ', config.account_address);
  const provider = new starknet.RpcProvider({ nodeUrl: endpoint });
  let isLiquidity = false;

  const pool = await monitorEvents(provider, config);
  console.log('\nPool address:', addrToHex(pool));
  while (!isLiquidity) {
    isLiquidity = (await assertLiquidity(provider, pool)) as boolean;
    if (isLiquidity) {
      console.log(chalk.red.bold.underline("\nLet's buy this shit"));
      await buybuy(provider, config);
      break;
    } else {
      console.log(
        "No liquidity yet... Monitoring for 'addLiquidity' transaction"
      );
      await delay(10000); // Wait for 10 seconds before checking again
    }
  }
}

async function directBuy(
  network: string,
  tokenAddr: string,
  ethAmount: number
) {
  let endpoint =
    network == 'mainnet' ? STARKNET_API_ENDPOINT : TESTNET_GOERLI_ENDPOINT;
  let config = buildConfig(network, tokenAddr, ethAmount);
  let am = (config.amount.low.valueOf() as number) * 10 ** -18;
  console.log(`\nETH TO SPEND > ${am} ETH`);
  console.log('\nToken to snipe > ', config.token);
  console.log('\nAccount > ', config.account_address);
  const provider = new starknet.RpcProvider({ nodeUrl: endpoint });

  try {
    let buy = await buybuy(provider, config);
  } catch (error) {
    console.log('buying error, ', error);
  }
}

function buildConfig(
  network: string,
  token: string,
  amount: number
): SnipeConfig {
  token = token.toLowerCase();
  token = starknet.addAddressPadding(token);
  const amountInWei = amount * 10 ** 18;
  let amountEth = starknet.cairo.uint256(amountInWei);
  let config =
    network == 'mainnet'
      ? {
          network: network,
          token: token,
          jedi_factory_address: cnst.JEDI_FACTORY_ADDRESS,
          jedi_router_address: cnst.JEDI_ROUTER_ADDRESS,
          account_address: process.env.ACCOUNT_ADDRESS as string,
          private_key: process.env.PRIVATE_KEY as string,
          amount: amountEth,
        }
      : {
          network: network,
          token: token,
          jedi_factory_address: cnst.JEDI_FACTORY_ADDRESS_GOERLI,
          jedi_router_address: cnst.JEDI_ROUTER_ADDRESS_GOERLI,
          account_address: process.env.GOERLI_ADDRESS as string,
          private_key: process.env.GOERLI_PRIVATE_KEY as string,
          amount: amountEth,
        };
  return config;
}

function main() {
  const program = new Command();

  console.log(chalk.redBright(figlet.textSync('Intervention')));

  program
    .version('1.0.0')
    .description('Shitcoin sniper bot on Starknet')
    .option(
      '-n, --network <string>',
      'Specify the network to use (e.g., mainnet, goerli, sepolia)',
      'mainnet'
    )
    .option('-t, --token <address>', 'Specify the token address to snipe')
    .option(
      '-a, --amount <number>',
      'Specify the amount of eth to spend (in ETH e.g., 1, 0.5, 0.001)'
    )
    .option(
      '-b, --buy',
      'Buy the token directly instead of monitoring the pool'
    )
    .parse(process.argv);

  const options = program.opts();
  if (!options.amount) {
    console.error(chalk.red('Error: ETH amount is required.'));
    program.help();
  }

  if (!options.token) {
    console.error(chalk.red('Error: Token address is required.'));
    program.help();
  }

  if (options.network === 'mainnet' || options.network === 'goerli') {
    if (options.buy) {
      console.log(chalk.green('BUYING TOKEN DIRECTLY'));
      directBuy(options.network, options.token, options.amount);
    } else {
      console.log(chalk.green(`Network ${options.network}, LET'S SNIPE`));
      startApplication(options.network, options.token, options.amount);
    }
  } else {
    console.error(chalk.red('Error: Unsupported network.'));
  }
}

if (require.main === module) {
  main();
}
