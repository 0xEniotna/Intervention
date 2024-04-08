import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import * as figlet from 'figlet';
import chalk from 'chalk';

import * as starknet from 'starknet';
import { addrToHex } from './utils';

import { FACTORY_UNISWAP_ABI } from './ABIs/uniswap/factory';
import { UNISWAP_PAIR_ABI } from './ABIs/uniswap/pair';
import { ROUTER_UNISWAP_ABI } from './ABIs/uniswap/router';

import * as cnst from './constants';
import { ERC20_ABI_SOL } from './ABIs/token/erc20';

import { JsonRpcProvider, Contract } from 'ethers';
import { ethers } from 'ethers';

const SEPOLIA_ETHEREUM_ENDPOINT = process.env.SEPOLIA_ETHEREUM_ENDPOINT;

export type SnipeConfig = {
  network: string;
  token: string;
  uniswapFactoryAddress: string;
  uniswapRouterAddress: string;
  account_address: string;
  private_key: string;
  amount: ethers.Numeric;
};

export async function getPairFromToken(
  provider: JsonRpcProvider,
  config: SnipeConfig
): Promise<any | null> {
  try {
    const factoryContract: Contract = new Contract(
      config.uniswapFactoryAddress,
      FACTORY_UNISWAP_ABI,
      provider
    );

    const pair = await factoryContract.getPool(
      config.token,
      cnst.WETH_SEPOLIA_ADDRESS,
      3000
    );
    return pair;
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function getTokensFromPair(
  provider: JsonRpcProvider,
  pairAddr: string
): Promise<any | null> {
  try {
    const pairContract: Contract = new Contract(
      pairAddr,
      UNISWAP_PAIR_ABI,
      provider
    );

    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();

    return { token0: token0, token1: token1 };
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return null;
  }
}

export async function getPairCreatedEvents(
  provider: JsonRpcProvider,
  block: number,
  config: SnipeConfig
) {
  try {
    const factoryContract: Contract = new Contract(
      config.uniswapFactoryAddress,
      FACTORY_UNISWAP_ABI,
      provider
    );

    const rawFilter = factoryContract.filters.PoolCreated();
    const filter = await rawFilter.getTopicFilter();
    const logs = await provider.getLogs({
      address: config.uniswapFactoryAddress,
      fromBlock: block - 1000,
      toBlock: block,
      topics: filter,
    });
    return logs.map((log) => factoryContract.interface.parseLog(log));
  } catch (error) {
    console.error('Error fetching pair:', error);
    return null;
  }
}

export async function getLatestIncludedBlockWrapper(provider: JsonRpcProvider) {
  try {
    const block = await provider.getBlockNumber();
    return block;
  } catch (error) {
    console.error('Error fetching block:', error);
    return null;
  }
}

export async function getBlockWrapper(
  provider: JsonRpcProvider,
  blockNumber: number
) {
  try {
    const block = await provider.getBlock(blockNumber);
    return block;
  } catch (error) {
    console.error('Error fetching block:', error);
    return null;
  }
}

export async function monitorEvents(
  provider: JsonRpcProvider,
  config: SnipeConfig
) {
  let lastProcessedBlock: number | null = null;
  let attemptCount = 0;
  let currentBlock;
  console.log('\n');

  while (true) {
    console.log(`Attempt ${++attemptCount}: Checking for new block...`);

    try {
      // currentBlock = await getLatestIncludedBlockWrapper(provider);
      currentBlock = 5464678;

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
  const matchingEvent = events.find(
    (event) =>
      (event.args[0].toLowerCase() === address &&
        event.args[1].toLowerCase() ===
          cnst.WETH_SEPOLIA_ADDRESS.toLowerCase()) ||
      (event.args[1].toLowerCase() === address &&
        event.args[0].toLowerCase() === cnst.WETH_SEPOLIA_ADDRESS.toLowerCase())
  );
  if (!matchingEvent) {
    console.log('No matching event found');
    return undefined;
  } else {
    return matchingEvent.args[4]; //pair address
  }
}

// export async function getAmountOutWrapper(
//   provider: starknet.RpcProvider,
//   path: Array<any>,
//   config: SnipeConfig
// ) {
//   const routerContract: starknet.Contract = new starknet.Contract(
//     JEDI_ROUTER_ABI,
//     config.jedi_router_address,
//     provider
//   );
//   let routerContractTyped = routerContract.typed(JEDI_ROUTER_ABI);
//   try {
//     let amountOut = await routerContractTyped.get_amounts_out(
//       config.amount,
//       path
//     );
//     return amountOut['amounts'][1];
//   } catch (error) {
//     console.error('Error fetching LP address:', error);
//     return null;
//   }
// }

export async function assertLiquidity(
  provider: JsonRpcProvider,
  pairAddr: string
): Promise<boolean | null> {
  const pairContract: Contract = new Contract(
    pairAddr,
    UNISWAP_PAIR_ABI,
    provider
  );

  try {
    let res = await pairContract.get_reserves();
    if (res.reserve0.low > 0 && res.reserve1.low > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching LP address:', error);
    return false;
  }
}

// export async function buybuy(
//   provider: starknet.RpcProvider,
//   config: SnipeConfig
// ) {
//   const routerContract: starknet.Contract = new starknet.Contract(
//     JEDI_ROUTER_ABI,
//     config.jedi_router_address,
//     provider
//   );
//   let account = new starknet.Account(
//     provider,
//     config.account_address,
//     config.private_key,
//     '1'
//   );
//   const eth: starknet.Contract = new starknet.Contract(
//     ERC20_ABI,
//     cnst.ETH_ADDRESS,
//     provider
//   );

//   try {
//     let path = [cnst.ETH_ADDRESS, config.token];
//     let amountOut = await getAmountOutWrapper(provider, path, config);

//     const unixTimestampNow = Math.floor(Date.now() / 1000);

//     const multiCall = await account.execute([
//       {
//         contractAddress: eth.address,
//         entrypoint: 'approve',
//         calldata: starknet.CallData.compile({
//           spender: routerContract.address,
//           amount: config.amount,
//         }),
//       },
//       {
//         contractAddress: routerContract.address,
//         entrypoint: 'swap_exact_tokens_for_tokens',
//         calldata: starknet.CallData.compile({
//           amountIn: config.amount,
//           amountOutMin: amountOut,
//           path: path,
//           to: starknet.cairo.felt(account.address),
//           deadline: starknet.cairo.felt(unixTimestampNow + 1000),
//         }),
//       },
//     ]);

//     let response = await provider.waitForTransaction(
//       multiCall.transaction_hash
//     );
//     console.log('✅ Transaction hash =', response.transaction_hash);
//   } catch (error) {
//     console.error('Error swaping tokens', error);
//     return null;
//   }
// }

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
    network == 'mainnet'
      ? SEPOLIA_ETHEREUM_ENDPOINT
      : SEPOLIA_ETHEREUM_ENDPOINT;
  let config = buildConfig(network, tokenAddr, ethAmount);
  console.log('config', config);
  let am = config.amount;
  console.log(`\nETH TO SPEND > ${am} ETH`);
  console.log('\nToken to snipe > ', config.token);
  console.log('\nAccount > ', config.account_address);
  const provider = new JsonRpcProvider(endpoint);
  let isLiquidity = false;
  const pool = await monitorEvents(provider, config);
  console.log('\nPool address:', addrToHex(pool));
  while (!isLiquidity) {
    isLiquidity = (await assertLiquidity(provider, pool)) as boolean;
    if (isLiquidity) {
      console.log(chalk.red.bold.underline("\nLet's buy this shit"));
      // await buybuy(provider, config);
      break;
    } else {
      console.log(
        "No liquidity yet... Monitoring for 'addLiquidity' transaction"
      );
      await delay(10000); // Wait for 10 seconds before checking again
    }
  }
}

// async function directBuy(
//   network: string,
//   tokenAddr: string,
//   ethAmount: number
// ) {
//   let endpoint =
//     network == 'mainnet'
//       ? ARBITRUM_SEPOLIA_ENDPOINT
//       : ARBITRUM_SEPOLIA_ENDPOINT;
//   let config = buildConfig(network, tokenAddr, ethAmount);
//   let am = (config.amount.low.valueOf() as number) * 10 ** -18;
//   console.log(`\nETH TO SPEND > ${am} ETH`);
//   console.log('\nToken to snipe > ', config.token);
//   console.log('\nAccount > ', config.account_address);
//   const provider = new starknet.RpcProvider({ nodeUrl: endpoint });

//   try {
//     let buy = await buybuy(provider, config);
//   } catch (error) {
//     console.log('buying error, ', error);
//   }
// }

function buildConfig(
  network: string,
  token: string,
  amount: number
): SnipeConfig {
  token = token.toLowerCase();
  const amountInWei = amount * 10 ** 18;
  let amountEth = ethers.toNumber(amountInWei);
  let config =
    network == 'mainnet'
      ? {
          network: network,
          token: token,
          uniswapFactoryAddress: cnst.JEDI_FACTORY_ADDRESS,
          uniswapRouterAddress: cnst.JEDI_ROUTER_ADDRESS,
          account_address: process.env.ACCOUNT_ADDRESS as string,
          private_key: process.env.PRIVATE_KEY as string,
          amount: amountEth,
        }
      : {
          network: network,
          token: token,
          uniswapFactoryAddress: cnst.UNISWAP_FACTORY_ADDRESS,
          uniswapRouterAddress: cnst.UNISWAP_ROUTER_ADDRESS,
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
  // if (!options.amount) {
  //   console.error(chalk.red('Error: ETH amount is required.'));
  //   program.help();
  // }

  // if (!options.token) {
  //   console.error(chalk.red('Error: Token address is required.'));
  //   program.help();
  // }

  if (options.network === 'mainnet' || options.network === 'goerli') {
    if (options.buy) {
      console.log(chalk.green('BUYING TOKEN DIRECTLY'));
      // directBuy(options.network, options.token, options.amount);
    } else {
      console.log(chalk.green(`Network ${options.network}, LET'S SNIPE`));
      // startApplication(options.network, options.token, options.amount);
      startApplication(options.network, options.token, 0.001);
    }
  } else {
    console.error(chalk.red('Error: Unsupported network.'));
  }
}

if (require.main === module) {
  main();
}
