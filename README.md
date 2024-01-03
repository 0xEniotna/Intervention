# Starknet Sniper Bot

## Description

Intervention is a command-line tool designed to automate the process of monitoring and trading tokens on the Starknet blockchain. It allows users to specify a token address and monitor events for liquidity. When liquidity is detected, the bot can automatically execute a trade.

## Features

- Monitor Starknet for specified token liquidity.
- Automate token buying process upon liquidity detection.
- Support for both mainnet and Goerli testnet.
- Ability to directly buy a token without monitoring the pool.

## Prerequisites

- Node.js and npm installed.
- Starknet accounts and private keys set up for trading.
- Familiarity with command-line tools and TypeScript.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/0xEniotna/Intervention.git
   ```
2. Navigate to the project directory:
   ```sh
   cd starknet-sniper-bot
   ```
3. Install the required dependencies:
   ```sh
   yarn
   ```

## Configuration

Create a `.env` file in the root of your project and populate it with the following environment variables:

```
STARKNET_API_ENDPOINT=[Your Starknet API endpoint] (RPC)
TESTNET_GOERLI_ENDPOINT=[Your Goerli testnet endpoint]
PRIVATE_KEY=[Your private key]
ACCOUNT_ADDRESS=[Your Starknet account address]
```

## Usage

Run the bot with the following command:

```sh
yarn snipe --network <network> --token <token address> --amount <amount in ETH>
```

Options:

- `-n, --network <string>`: Specify the network to use (e.g., `mainnet`, `goerli`).
- `-t, --token <address>`: Specify the token address to snipe.
- `-a, --amount <number>`: Specify the amount of ETH to spend.
- `-b, --buy`: (Optional) Buy the token directly instead of monitoring the pool.

Example:

```sh
yarn snipe -n mainnet -t 0x1234... -a 0.1
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
