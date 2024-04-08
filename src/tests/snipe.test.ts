import { expect } from 'chai';
import * as Snipe from '../snipe_sn';
import dotenv from 'dotenv';
import * as starknet from 'starknet';
import { addrToHex } from '../utils';
import { JEDI_FACTORY_ADDRESS, JEDI_ROUTER_ADDRESS } from '../constants';

dotenv.config();

const STARKNET_API_ENDPOINT = process.env.STARKNET_API_ENDPOINT;
const ALCHEMY = process.env.ALCHEMY;
const NETHERMIND = process.env.NETHERMIND;

describe('snipe', () => {
  let provider: starknet.RpcProvider;
  let providerAlch: starknet.RpcProvider;
  let providerNet: starknet.RpcProvider;
  let config: Snipe.SnipeConfig;

  beforeEach(() => {
    provider = new starknet.RpcProvider({
      nodeUrl: STARKNET_API_ENDPOINT,
    });
    providerAlch = new starknet.RpcProvider({
      nodeUrl: ALCHEMY,
    });
    providerNet = new starknet.RpcProvider({
      nodeUrl: NETHERMIND,
    });
    config = {
      network: '',
      token: '',
      jedi_factory_address: JEDI_FACTORY_ADDRESS,
      jedi_router_address: JEDI_ROUTER_ADDRESS,
      account_address: '',
      private_key: '',
      amount: starknet.cairo.uint256(0),
    };
  });

  it('should return expected pair blast', async () => {
    config.token =
      '0x6f15ec4b6ff0b7f7a216c4b2ccdefc96cbf114d6242292ca82971592f62273b';
    const result = await Snipe.getPairFromToken(provider, config);
    {
      result &&
        expect(addrToHex(result.pair)).to.equal(
          '0x4f3943c6e74c805a9164f322fb9cf74ce371076241509a410f6610bff5c37d9'
        );
    }
  });

  it('get_reserves should return true', async () => {
    const result = await Snipe.assertLiquidity(
      provider,
      '0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a'
    );
    {
      result && expect(result).to.equal(true);
    }
  });

  it('getAmountOut should return value', async () => {
    const tokens = await Snipe.getTokensFromPair(
      provider,
      '0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a'
    );
    let path = [tokens.token0.address, tokens.token1.address];
    // console.log(path);
    const result = await Snipe.getAmountOutWrapper(provider, path, config);
    {
      result &&
        expect(result['amounts'][0].low).not.to.equal(0) &&
        expect(result['amounts'][1].low).not.to.equal(0);
    }
  });
});
