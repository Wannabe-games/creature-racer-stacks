const {
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");


async function main() {
  const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  const network = new StacksTestnet( { url: apiEndpoint } );
  const deployerKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
  const deployerAddr = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const faucetAddr = 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6';

  const txOptions = {
    recipient: faucetAddr,
    amount: 100000000000n,
    senderKey: deployerKey,
    network,
    memo: 'faucet topup',
    fee: 20000n,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeSTXTokenTransfer(txOptions);

  const broadcastResponse = await broadcastTransaction(transaction, network);
  const txId = broadcastResponse.txid;
  return txId;
}

main().then(function (txid) {
  console.log('submitted transaction: ', '0x' + txid);
});
