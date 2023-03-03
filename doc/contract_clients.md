# Interacting with smart contracts

Stacks node exposes [REST API](https://docs.hiro.so/api) which
clients can use to interact with the blockchain.

The rest of this document assumes that you are running normal
Linux OS. Depending on your OS or OS distribution you may need to
install additional tools or fine-tune paths.

## Bootstrapping a devnet

First, you need both docker and
[clarinet](https://github.com/hirosystems/clarinet) installed. 

Start your local devnet:

```sh
cd protocol
clarinet integrate
```

Unless you've changed settings in `Devnet.toml`, this should give
you:

- local API node listening at http://localhost:3999
- local stacks explorer service running at http://localhost:8000

## Creating client to interact with the rNFT contract

For convenience we use NodeJS for client development. 

### Setup a NodeJS project

```sh
mkdir rnft-mint
cd rnft-mint
npm install --save @stacks/transactions @stacks/network
```
### Write a client code

This example calls a `mint` function of
`creature-racer-referral-nft` contract. 

Create a file i.e. `mint.js`:

```javascript
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
  const operatorKey = '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601

  const receiverAddress = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';

  const callArgs = {
    contractAddress: deployerAddress,
    contractName: 'creature-racer-referral-nft-v3',
    functionName: 'mint',
    fee: 500,
    // functionArgs correspond to arguments required by mint function
    functionArgs: [ standardPrincipalCV(receiverAddress),
                    stringAsciiCV('ABCDEF') ],
    senderKey: operatorKey,
    validateWithAbi: true,
    network,
    // post conditions could be added here
  };
  
  // make a request and submit it to the network
  const tx = await makeContractCall(callArgs);
  const result = await broadcastTransaction(tx, network);

  return result.txid;
}

main().then(function (txid) {
  console.log('submitted transaction: ', '0x' + txid);
});
```

### Running the program

```sh
node mint.js
```

should output something like:

```
submitted transaction: <YOUR_TX_ID>
```

### Inspecting the results

If the call was successful it should output the transaction
id. You can now observe the transaction status in stacks
explorer, i.e.:

http://localhost:8000/txid/YOUR_TX_ID?chain=testnet

