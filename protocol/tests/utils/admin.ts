import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { bytesToHex, asciiToBytes } from 'https://esm.sh/@stacks/common';
import { pubKeyfromPrivKey, makeRandomPrivKey,
         privateKeyToString,
         TransactionVersion,
         getAddressFromPrivateKey,
         signMessageHashRsv,
         createStacksPrivateKey,
         stringUtf8CV,
         serializeCV } from 'https://esm.sh/@stacks/transactions';
import { sha256 } from "https://denopkg.com/chiefbiiko/sha256@v1.0.0/mod.ts";

export function setOperator(chain: Chain, deployer: Account, 
                     operator: Account) {
  let secretKey = 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901';
  let block = chain.mineBlock([
    Tx.contractCall('creature-racer-admin-v5',
                    'set-operator', 
                    [types.some(types.principal(operator.address))],
                    deployer.address)
  ]);
  assertEquals(block.receipts.length, 1);
  assertEquals(block.receipts[0].result, '(ok true)');
}


function uint128toBytes(v: bigint) {
  var rv = [];

  for(var n = 0; n < 16; n++) {
    rv[n] = Number(BigInt.asUintN(8, v & 0xffn));
    v = v >> 8n;
  }
  return rv;
}


function uint32toBytes(v: number) {
  var rv = [];

  for(var n = 0; n < 4; n++) {
    rv[3-n] = v & 0xff;
    v = v >> 8;
  }
  return rv;
}

// This outputs array of 16 128bit
// uints representing given ASCII string
// this corresponds to what ascii-to-uint
// Clarity function does in creature racer
// NFT contract.
function toUint128Array(s: string) {
  return [
    makeWord(s, 0), makeWord(s, 16),
    makeWord(s, 32), makeWord(s, 48),
    makeWord(s, 64), makeWord(s, 80),
    makeWord(s, 96), makeWord(s, 112),
    makeWord(s, 128), makeWord(s, 144),
    makeWord(s, 160), makeWord(s, 176),
    makeWord(s, 192), makeWord(s, 208),
    makeWord(s, 224), makeWord(s, 240)
  ];
}

function makeWord(s: string, i: number): bigint {
  return (ordAt(s, i) << 120n) |
     (ordAt(s, i + 1) << 112n) |
     (ordAt(s, i + 2) << 104n) |
     (ordAt(s, i + 3) <<  96n) |
     (ordAt(s, i + 4) <<  88n) |
     (ordAt(s, i + 5) <<  80n) |
     (ordAt(s, i + 6) <<  72n) |
     (ordAt(s, i + 7) <<  64n) |
     (ordAt(s, i + 8) <<  56n) |
     (ordAt(s, i + 9) <<  48n) |
     (ordAt(s, i + 10) << 40n) |
     (ordAt(s, i + 11) << 32n) |
     (ordAt(s, i + 12) << 24n) |
     (ordAt(s, i + 13) << 16n) |
     (ordAt(s, i + 14) << 8n)  |
     ordAt(s, i + 15);
}

function ordAt(s: string, i: number): bigint {
  if(i < s.length) {
    return BigInt(s.charCodeAt(i));
  } else {
    return 0n;
  }
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
  senderPubKey: string
}

export type Identity = {
  address: string,
  secretKey: string,
  publicKey: string
}

export function makeSignatureWithURI(operatorPK: string,
                                     senderPK: string,
                                     uri: string,
                                     ...rest: bigint[]): ArgSigs {
  const uriAsBytes = toUint128Array(uri);
  rest = rest.concat(uriAsBytes);
  return makeSignature(operatorPK, senderPK, ...rest);
}

export function makeSignature(operatorPK: string,
                              senderPK: string,
                              ...args: bigint[]): ArgSigs {
  // Start by computing argument checksum
  const pkData = parseHexString(senderPK);
  var buff = pkData;
  for(var i = 0; i < args.length; i++) {
    buff = buff.concat(uint128toBytes(args[i]));
  }

  const msghash = sha256(buff);
  const opsig = signMessageHashRsv({ messageHash: msghash,
                                     privateKey: createStacksPrivateKey(operatorPK) });
  return { operatorSignature: parseHexString(opsig.data),
           senderPubKey: pkData };
}

export function makeSignatureStr(operatorPK: string,
                                 senderPK: string,
                                 argsUtf8: string[],
                                 argsAscii: string[]): ArgSigs {
  const pkData = parseHexString(senderPK);
  var buff = pkData;

  if(argsAscii.length > 0) {
    const argA = argsAscii.join('');
    const argABuff = asciiToBytes(argA);
    buff = buff.concat(0xD); // CV type for ASCII string; see @stacks/transactions/src/clarity/constants.ts
    buff = buff.concat(uint32toBytes(argABuff.length));
    for(var i = 0; i < argABuff.length; i++) {
      buff = buff.concat(argABuff[i]);
    }
  }
  if(argsUtf8.length > 0) {
    const argU = argsUtf8.join('');
    const argUBuff = Uint8Array.from(argU.split("").map(x => x.charCodeAt()));
    buff = buff.concat(0xE); // CV type, 0xE means UTF-8 string
    buff = buff.concat(uint32toBytes(argUBuff.length));
    for(var i = 0; i < argUBuff.length; i++) {
      buff = buff.concat(argUBuff[i]);
    }
  }

  const msghash = sha256(buff);
  const opsig = signMessageHashRsv({ messageHash: msghash,
                                     privateKey: createStacksPrivateKey(operatorPK) });
  return { operatorSignature: parseHexString(opsig.data),
           senderPubKey: pkData };
}

export function makeRandomIdentity(): Identity {
  const sk = makeRandomPrivKey();
  const skdata = new Uint8Array([...sk.data, 1]);
  const skstr = bytesToHex(skdata);
  const addr = getAddressFromPrivateKey(skdata,
                                       TransactionVersion.Testnet);
  return { address: addr, secretKey: skstr,
           publicKey: bytesToHex(pubKeyfromPrivKey(skstr).data) }
}
