import axios from "axios";

export function addrToHex(raw: string) {
  return "0x" + BigInt(raw).toString(16);
}

export async function getPendingTransactions(): Promise<any[] | null> {
  try {
    const feederGatewayUrl = "https://alpha-mainnet.starknet.io/feeder_gateway";
    const gatewayUrl = `${feederGatewayUrl}/get_block`;

    const response = await axios.get(gatewayUrl);
    return response.data.transactions;
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return null;
  }
}

export async function monitorPendingTransactions() {
  while (true) {
    const pendingTransactions = await getPendingTransactions();
    console.log("Pending Transactions:", pendingTransactions);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking again
  }
}
