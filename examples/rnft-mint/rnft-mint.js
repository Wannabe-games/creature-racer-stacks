const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  stringUtf8CV,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");


async function main() {
  const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // Get a valid parameters from your protocol/settings/Devnet.toml
  const deployerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const senderKey = '6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01';
  
  const receiverAddress = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';

  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-referral-nft',
    functionName: 'mint',
    fee: 500,
    functionArgs: [ standardPrincipalCV(receiverAddress),
                    stringUtf8CV('ABCDEF') ],
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
