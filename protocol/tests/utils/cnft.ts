import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { makeSignature, makeSignatureWithURI, Identity } from './admin.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

export function mintCreature(chain: Chain, user: Identity,
                     nftParams: [], uri: string = 'whatever') {
  const skOperator = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
   
  const sigs = makeSignatureWithURI(skOperator, user.publicKey,
                                    uri,
                                    ...nftParams);
  let b = chain.mineBlock([
    Tx.contractCall('creature-racer-nft-v5', 'mint',
                    [ types.uint(nftParams[0]),
                      types.buff([Number(nftParams[1])]),
                      types.buff([Number(nftParams[2]),Number(nftParams[3]),
                                  Number(nftParams[4]),Number(nftParams[5]),
                                  Number(nftParams[6])]),
                      types.uint(nftParams[7]),
                      types.uint(nftParams[8]),
                      types.ascii(uri),
                      types.buff(sigs.operatorSignature),
                      types.buff(sigs.senderPubKey) ],
                    user.address)
  ]);

  return b;
}

export function transferCreature(chain: Chain, 
                                 nft: number,
                                 transferringAccount: Identity,
                                 fromAccount: Identity,
                                 toAccount: Identity) {
  let b = chain.mineBlock([
    Tx.contractCall('creature-racer-nft-v5', 'transfer',
                    [ types.uint(nft),
                      types.principal(fromAccount.address),
                      types.principal(toAccount.address) ],
                    transferringAccount.address)
  ]);
  assertEquals(b.receipts.length, 1);
  return b.receipts[0].result;
}


export function approveTransfer(chain: Chain, nft: number,
                                 owner: Identity, 
                                 delegate: string) {
  let b = chain.mineBlock([
    Tx.contractCall('creature-racer-nft-v5',
                    'approve',
                    [types.principal(delegate),
                     types.uint(nft),
                     types.bool(true)],
                    owner.address)
  ]);
  assertEquals(b.receipts.length, 1);
  assertEquals(b.receipts[0].result, '(ok true)')
}
