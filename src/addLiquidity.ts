import {
  RpcProvider,
  Account,
  Contract,
  json,
  stark,
  uint256,
  shortString,
  CallData,
  cairo,
} from 'starknet';
import fs from 'fs';
import dotenv from 'dotenv';
import * as Snipe from './snipe_sn';
dotenv.config();

import * as cnst from './constants';
import { JEDI_ROUTER_ABI } from './ABIs/jediswap/router';
import { ERC20_ABI } from './ABIs/token/erc20';

const STARKNET_API_ENDPOINT = process.env.STARKNET_API_ENDPOINT;
const TESTNET_GOERLI_ENDPOINT = process.env.TESTNET_GOERLI_ENDPOINT;
const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY as string;
const ACCOUNT_ADDRESS = process.env.GOERLI_ADDRESS as string;

export async function addLiquidity() {
  // connect provider
  const provider = new RpcProvider({ nodeUrl: TESTNET_GOERLI_ENDPOINT });
  let eth_amount = cairo.uint256(100000000000);
  const routerContract: Contract = new Contract(
    JEDI_ROUTER_ABI,
    cnst.JEDI_ROUTER_ADDRESS_GOERLI,
    provider
  );
  let account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY, '1');

  const eth: Contract = new Contract(ERC20_ABI, cnst.ETH_ADDRESS, provider);
  const token: Contract = new Contract(ERC20_ABI, cnst.TOKEN, provider);
  try {
    // get time now from computer
    const unixTimestampNow = Math.floor(Date.now() / 1000);
    let balanceToken = await token.balanceOf(account.address);

    routerContract.connect(account);
    const multiCall = await account.execute([
      {
        contractAddress: token.address,
        entrypoint: 'approve',
        calldata: CallData.compile({
          spender: routerContract.address,
          amount: cairo.uint256(balanceToken),
        }),
      },
      {
        contractAddress: eth.address,
        entrypoint: 'approve',
        calldata: CallData.compile({
          spender: routerContract.address,
          amount: eth_amount,
        }),
      },
      {
        contractAddress: routerContract.address,
        entrypoint: 'add_liquidity',
        calldata: CallData.compile({
          tokenA: cairo.felt(eth.address),
          tokenB: cairo.felt(token.address),
          amountADesired: eth_amount,
          amountBDesired: cairo.uint256(balanceToken),
          amountAMin: cairo.uint256(1),
          amountBMin: cairo.uint256(1),
          to: cairo.felt(account.address),
          deadline: cairo.felt(unixTimestampNow + 1000),
        }),
      },
    ]);

    let receipt = await provider.waitForTransaction(multiCall.transaction_hash);
    console.log('✅ Transaction hash =', receipt);
  } catch (error) {
    console.error('Error swaping tokens', error);
    return null;
  }
}

addLiquidity();
