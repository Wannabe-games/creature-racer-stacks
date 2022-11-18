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
  const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // Get a valid parameters from your protocol/settings/Devnet.toml
  const deployerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const deployerKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

  if(process.argv.length < 4) {
    console.log("usage: node set-operator.js address pubkey");
    return;
  }

  const operatorAddress = process.argv[2];
  const operatorPubKey = Buffer.from(process.argv[3], "hex");


  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-admin',
    functionName: 'set-operator',
    fee: 500,
    functionArgs: [ someCV(standardPrincipalCV(operatorAddress)),
                    someCV(bufferCV(operatorPubKey)) ],
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
