import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { bytesToHex } from 'https://esm.sh/@stacks/common';
import { pubKeyfromPrivKey, makeRandomPrivKey,
         privateKeyToString,
         TransactionVersion,
         getAddressFromPrivateKey,
         signMessageHashRsv,
         createStacksPrivateKey } from 'https://esm.sh/@stacks/transactions';
import { sha256 } from "https://denopkg.com/chiefbiiko/sha256@v1.0.0/mod.ts";

export function setOperator(chain: Chain, deployer: Account, 
                     operator: Account) {
  let secretKey = 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901';
  let block = chain.mineBlock([
    Tx.contractCall('creature-racer-admin',
                    'set-operator', 
                    [types.some(types.principal(operator.address))],
                    deployer.address)
  ]);
  assertEquals(block.receipts.length, 1);
  assertEquals(block.receipts[0].result, '(ok true)');
}


function uint128toBytes(v: number) {
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

type ArgSigs = {
  operatorSignature: string,
  senderSignature: string
}

type Identity = {
  address: string,
  secretKey: string,
  publicKey: string
}

export function makeSignatures(operatorPK: string,
                               senderPK: string,
                               ...args: number[]): ArgSigs {
  // Start by computing argument checksum
  var buff = [];
  for(var i = 0; i < args.length; i++) {
    buff = buff.concat(uint128toBytes(args[i]));
  }

  const argshash = sha256(buff);
  // sign the hash with sender key
  const ssig = signMessageHashRsv({ messageHash: argshash,
                                    privateKey: createStacksPrivateKey(senderPK) });
  const msg = parseHexString(ssig.data).concat(buff);
  const msghash = sha256(msg);
  const opsig = signMessageHashRsv({ messageHash: msghash,
                                     privateKey: createStacksPrivateKey(operatorPK) });
  return { senderSignature: parseHexString(ssig.data),
           operatorSignature: parseHexString(opsig.data) };
}

export function makeRandomIdentity(): Identity {
  const sk = makeRandomPrivKey();
  const skdata = new Uint8Array([...sk.data, 1]);
  const skstr = bytesToHex(skdata);
  const addr = getAddressFromPrivateKey(skdata,
                                       TransactionVersion.Testnet);
  return { address: addr, secretKey: skstr,
           publicKey: pubKeyfromPrivKey(skdata) }
}
