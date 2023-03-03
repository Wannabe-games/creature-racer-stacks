const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  uintCV, bufferCV,
  pubKeyfromPrivKey, 
  privateKeyToString,
  TransactionVersion,
  signMessageHashRsv,
  createStacksPrivateKey,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  makeStandardSTXPostCondition,
  AnchorMode
} = require("@stacks/transactions");
const { bytesToHex } = require("@stacks/common");
const { StacksTestnet } = require("@stacks/network");

const sha256 = require("sha256");

const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// Note that operator (i.e. backend) address needs to be first set
// (see set-operator.js in examples/admin).
const operatorAddress = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
// Operator's secret key (needs to match the address)
const operatorKey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';


function uint128toBytes(v) {
  var rv = [];

  for(var n = 0; n < 16; n++) {
    rv[n] = v & 0xff;
    v = v >> 8;
  }
  return rv;
}

function parseHexString(str) { 
  var result = [];
  var i = 0;
  while (i < str.length) { 
    result.push(parseInt(str.substring(i, i+2), 16));
    i += 2;
  }

  return result;
}

function sign(buffer, key) {
  const hash = sha256(buffer);
  return signMessageHashRsv({ messageHash: hash,
                              privateKey: createStacksPrivateKey(key) });
}


/* Mint a creature and pay for it */
async function mintCreature(nftId, typeId, part1, part2, 
                            part3, part4, part5,
                            expiryTimestamp, price, ownerKey,
                            ownerPubKey, ownerAddr) {
  const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
  //const apiEndpoint = 'http://localhost:3999';
  const network = new StacksTestnet( { url: apiEndpoint } );

  // see `mint` in creature-racer-nft.clar

  // Sign minted creature arguments
  var payload = parseHexString(ownerPubKey);
  payload = payload.concat(uint128toBytes(nftId))
    .concat(uint128toBytes(typeId))
    .concat(uint128toBytes(part1))
    .concat(uint128toBytes(part2))
    .concat(uint128toBytes(part3))
    .concat(uint128toBytes(part4))
    .concat(uint128toBytes(part5))
    .concat(uint128toBytes(expiryTimestamp))
    .concat(uint128toBytes(price));


  // this signature should be requested from backend
  const operatorSignature = sign(payload, operatorKey);
  
  // Create post conditions to allow transferring up to
  // 50000 ustx to creature racer's payment contract
  const postConditions = [
    makeStandardSTXPostCondition(
      ownerAddr, FungibleConditionCode.LessEqual, 50000n),
    makeContractSTXPostCondition(
      contractAddress, 'creature-racer-payment-v3',
      FungibleConditionCode.LessEqual,
      50000n)
  ];

  const callArgs = {
    contractAddress: contractAddress,
    contractName: 'creature-racer-nft-v3',
    functionName: 'mint',
    fee: 500,
    functionArgs: [ 
      uintCV(nftId),                                   // nft-id
      bufferCV(new Uint8Array([typeId])),              // type-id
      bufferCV(new Uint8Array([ part1, part2, part3,   // parts
                                part4, part5 ])),
      uintCV(expiryTimestamp),
      uintCV(price),
      bufferCV(new Uint8Array(parseHexString(operatorSignature.data))),
      bufferCV(new Uint8Array(parseHexString(ownerPubKey)))
    ],
    senderKey: ownerKey,
    validateWithAbi: true,
    network,
    postConditions,
    anchorMode: AnchorMode.Any
  };
  const tx = await makeContractCall(callArgs);
  const result = await broadcastTransaction(tx, network);

  return result.txid;
}

async function main() {
  // Get a valid parameters from your protocol/settings/Devnet.toml
  const senderKey = '6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01';
  const senderPubKey = '029fb154a570a1645af3dd43c3c668a979b59d21a46dd717fd799b13be3b2a0dc7';
  const senderAddr = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP';

  // This mints the creature for sender and transfers 30000 ustx from 
  // sender's wallet to the contract. Funds are then propagated to 
  // payment contract which distributes them to reward and referral
  // pools.
  return await mintCreature(314159, 7, 1, 1, 1, 1, 1,
                            Math.floor(Date.now() / 1000) + 2592000,
                            30000,
                            senderKey,
                            senderPubKey,
                            senderAddr);
}

main().then(function (txid) {
  console.log('submitted transaction: ', '0x' + txid);
});
