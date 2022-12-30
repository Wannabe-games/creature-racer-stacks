const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  stringUtf8CV,
  bufferCV,
  someCV
} = require("@stacks/transactions");

const process = require('process');
const { StacksTestnet } = require("@stacks/network");


async function main() {
  // Endpoint for staging env.
  const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  // Endpoint for devnet (i.e. clarinet integrate)
  // const apiEndpoint = 'http://localhost:3999';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // Get a valid parameters from your protocol/settings/Devnet.toml
  const deployerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const deployerKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

  if(process.argv.length < 3) {
    console.log("usage: node set-operator.js address");
    return;
  }

  const operatorAddress = process.argv[2];


  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-admin-v2',
    functionName: 'set-operator',
    fee: 500,
    functionArgs: [ someCV(standardPrincipalCV(operatorAddress)) ],
    senderKey: deployerKey,
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
