const {
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  contractPrincipalCV,
  uintCV, bufferCV,
  trueCV,
  bufferCVFromString,
  pubKeyfromPrivKey, 
  privateKeyToString,
  TransactionVersion,
  NonFungibleConditionCode,
  createAssetInfo,
  makeContractNonFungiblePostCondition,
  AnchorMode, PostConditionMode
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");

const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const stakingContractName = 'creature-racer-staking-v4';

// Note that operator (i.e. backend) address needs to be first set
// (see set-operator.js in examples/admin).
const operatorAddress = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
// Operator's secret key (needs to match the address)
const operatorKey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';

const apiEndpoint = 'https://stacksapi-testnet.wannabe.games';
//const apiEndpoint = 'http://localhost:3999';


async function openNextCycle() {
  const network = new StacksTestnet( { url: apiEndpoint } );
  const callArgs = {
    contractAddress: contractAddress,
    contractName: stakingContractName,
    functionName: 'open-new-cycle',
    fee: 600,
    functionArgs: [ 
    ],
    senderKey: operatorKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
  };
  const tx = await makeContractCall(callArgs);
  const result = await broadcastTransaction(tx, network);

  return result.txid;  
}

async function leaveStaking(nftId, ownerKey, ownerAddr) {
  const network = new StacksTestnet( { url: apiEndpoint } );

  // NFT cannot be unstaked in the same cycle in which it was
  // staked. So let's start by emulating backend incrementing
  // the cycle.
  await openNextCycle();

  // Create post conditions to allow transferring the
  // nft
  const postConditionCode = NonFungibleConditionCode.Sends;
  const assetContractName = 'creature-racer-nft-v4';
  const assetName = 'creature-racer-creature-nft';
  const tokenAssetName = uintCV(nftId) ;
  const nonFungibleAssetInfo = createAssetInfo(contractAddress, 
                                               assetContractName,
                                               assetName);
  const postConditions = [
    makeContractNonFungiblePostCondition(
      contractAddress , stakingContractName,
      postConditionCode,
      nonFungibleAssetInfo,
      tokenAssetName),
  ];

  const callArgs = {
    contractAddress: contractAddress,
    contractName: stakingContractName,
    functionName: 'leave-staking',
    fee: 600,
    functionArgs: [ 
      uintCV(nftId),
    ],
    senderKey: ownerKey,
    validateWithAbi: true,
    network,
    anchorMode: AnchorMode.Any,
    postConditions: postConditions,
    postConditionMode: PostConditionMode.Deny,
  };
  const tx = await makeContractCall(callArgs);
  const result = await broadcastTransaction(tx, network);

  return result.txid;
}

async function main() {
  // Get a valid parameters from your protocol/settings/Devnet.toml
  const senderKey = '6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e01';
  const senderAddr = 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP';

  // This mints the creature for sender and transfers 30000 ustx from 
  // sender's wallet to the contract. Funds are then propagated to 
  // payment contract which distributes them to reward and referral
  // pools.
  return await leaveStaking(314159,
                            senderKey,
                            senderAddr);
}

main().then(function (txid) {
  console.log('submitted transaction: ', '0x' + txid);
});
