<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, useAccount, useOpenContractCall,
 useNetwork, useOpenSignMessage } from '@micro-stacks/vue';
import {   FungibleConditionCode,
           pubKeyfromPrivKey,
           makeContractSTXPostCondition,
           makeStandardSTXPostCondition } from 'micro-stacks/transactions';
import { uintCV, bufferCV, trueCV } from 'micro-stacks/clarity';

 import { client } from '@micro-stacks/client';
 import { StacksTestnet } from '@stacks/network';
import sha256 from 'sha256';
import { signMessageHashRsv, 
         createStacksPrivateKey } from '@stacks/transactions';
 
 const { openSignMessage } = $(useOpenSignMessage());
 const { isSignedIn }  = $(useAuth());
 const { openContractCall,
         isRequestPending } = $(useOpenContractCall());
const { stxAddress, appPrivateKey } = $(useAccount());

const nftId = ref('');

const stacksApiUrl = 'http://localhost:3999';
 //const stacksApiUrl = 'https://stacksapi-testnet.wannabe.games';

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
 
 function makeMintCall(pubKey: str) {
     const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
     const typeId = 4;
     const price = 3000;
     const expiryTimestamp = 1771372766;

     // Note, that below lines emulate operation that should be performed on
     // backend.
     const operatorKey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';

     var payload = parseHexString(pubKey);
     payload = payload.concat(uint128toBytes(nftId.value))
                      .concat(uint128toBytes(typeId))
                      .concat(uint128toBytes(1))
                      .concat(uint128toBytes(1))
                      .concat(uint128toBytes(1))
                      .concat(uint128toBytes(1))
                      .concat(uint128toBytes(1))
                      .concat(uint128toBytes(expiryTimestamp))
                      .concat(uint128toBytes(price));
     const operatorSignature = sign(payload, operatorKey);
     console.log("operator signature", operatorSignature);
     // Bakend returns operatorSignature, which is used in frontend
     // code below.

     const postConds = [
         makeStandardSTXPostCondition(
             stxAddress, FungibleConditionCode.LessEqual, '50000'),
         makeContractSTXPostCondition(
             contractAddress, 'creature-racer-payment-v4',
             FungibleConditionCode.LessEqual,
             '50000')
     ];
     const args = [
         uintCV(nftId.value),
         bufferCV(new Uint8Array([typeId])),
         bufferCV(new Uint8Array([ 1,1,1,1,1])),
         uintCV(expiryTimestamp),
         uintCV(price),
         bufferCV(new Uint8Array(parseHexString(operatorSignature.data))),
         bufferCV(new Uint8Array(parseHexString(pubKey)))
     ];

     const network = new StacksTestnet({
         url: stacksApiUrl,
     });

     openContractCall({
         contractAddress: contractAddress,
         contractName: 'creature-racer-nft-v4',
         functionName: 'mint',
         functionArgs: args,
         postConditions: postConds,
         attachment: 'test',
         network,
         validateWithAbi: true,
         onFinish: async data => {
             console.log('finished call', data);
         },
         onCancel: () => {
             console.log('user cancelled');
         },
     });
 }

 const onClick = async () => {
     const network = new StacksTestnet({
         url: stacksApiUrl
     });
     openSignMessage({
         message: "TEST",
         network,
         onFinish(payload) {
             makeMintCall(payload.publicKey);
         }
     });
 };
</script> 

<template>
    <div v-if="isSignedIn">
        <h3>Mint a ceature</h3>
        <input v-model="nftId" />
        <button :disabled="!nftId"
                type="button" 
                v-on:click="() => onClick()">
            {{
            isRequestPending ? 'pending' : nftId !== '' ? 'Mint' : 'Enter nft id'
            }}
        </button>
    </div>
</template>
