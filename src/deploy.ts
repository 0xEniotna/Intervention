import {
  RpcProvider,
  Account,
  Contract,
  json,
  stark,
  uint256,
  shortString,
  CallData,
} from 'starknet';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const STARKNET_API_ENDPOINT = process.env.STARKNET_API_ENDPOINT;
// const TESTNET_GOERLI_ENDPOINT = process.env.TESTNET_GOERLI_ENDPOINT;
const TESTNET_GOERLI_ENDPOINT = process.env.TESTNET_SEPOLIA_ENDPOINT;

// const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY as string;
// const ACCOUNT_ADDRESS = process.env.GOERLI_ADDRESS as string;
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY as string;
const ACCOUNT_ADDRESS = process.env.SEPOLIA_ACCOUNT_ADDRESS as string;

async function declareAndDeploy() {
  // connect provider
  const provider = new RpcProvider({ nodeUrl: TESTNET_GOERLI_ENDPOINT });
  // connect your account. To adapt to your own account:
  let account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY, '1'); // add ,"1" after privateKey0 if this account is not a Cairo 0 contract

  // Declare & deploy Test contract in devnet
  const compiledTestSierra = json.parse(
    fs
      .readFileSync(
        'contracts/target/dev/contracts_MyToken.compiled_contract_class.json'
      )
      .toString('ascii')
  );
  const compiledTestCasm = json.parse(
    fs
      .readFileSync(
        'contracts/target/dev/contracts_MyToken.contract_class.json'
      )
      .toString('ascii')
  );

  const contractCallData: CallData = new CallData(compiledTestCasm.abi);
  const contractConstructor = contractCallData.compile('constructor', {
    recipient: account.address,
  });

  const class_hash =
    '0x36fd53b4f3d5982ecf66c044933c730ff65e8d923c6b6c51421466b14543a4f';
  try {
    // const declareResponse = await account.declareIfNot({
    //   contract: compiledTestCasm,
    //   casm: compiledTestSierra,
    // });

    const invokeResponse = await account.deploy({
      classHash: class_hash,
      constructorCalldata: contractConstructor,
      salt: '0x00000001',
    });

    const address = invokeResponse;
    console.log('Test Contract Class Hash =', class_hash);
    // console.log('Declare Response =', declareResponse);

    console.log('✅ Transaction hash =', address.transaction_hash);
    console.log('✅ Contract addr =', address.contract_address);
  } catch (e) {
    console.log(e);
  }
  console.log('✅ Account connected at =', account.address);
  console.log('✅ Account nonce =', await account.getNonce());
}

declareAndDeploy();
