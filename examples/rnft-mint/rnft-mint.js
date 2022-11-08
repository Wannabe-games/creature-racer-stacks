const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  stringAsciiCV,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");


async function main() {
  const apiEndpoint = 'http://localhost:3999';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // Get a valid parameters from your protocol/settings/Devnet.toml
  const deployerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const operatorKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';
  
  const receiverAddress = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';

  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-referral-nft',
    functionName: 'mint',
    fee: 500,
    functionArgs: [ standardPrincipalCV(receiverAddress),
                    stringAsciiCV('ABCDEF') ],
    senderKey: operatorKey,
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
