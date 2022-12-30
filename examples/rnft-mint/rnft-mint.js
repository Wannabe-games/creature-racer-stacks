const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  stringUtf8CV,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");


async function main() {
  //const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  const apiEndpoint = 'http://localhost:3999';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // Get a valid parameters from your protocol/settings/Devnet.toml
  const deployerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  //const senderKey = '6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01';
  const senderKey =  'b463f0df6c05d2f156393eee73f8016c5372caa0e9e29a901bb7171d90dc4f1401';

  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-referral-nft-v2',
    functionName: 'mint',
    fee: 500,
    functionArgs: [ stringUtf8CV('ABCDEF11') ],
    senderKey: senderKey,
    validateWithAbi: true,
    network,
  };
  const tx = await makeContractCall(callArgs);
  const result = await broadcastTransaction(tx, network);

  return result.txid;
}

main().then(function (txid) {
  console.log('submitted transaction: ', '0x' + txid);
});
