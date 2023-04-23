import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { pubKeyfromPrivKey, makeRandomPrivKey,
         privateKeyToString,
         getAddressFromPrivateKey } from 'https://esm.sh/@stacks/transactions';
import { makeSignatureStr, Identity } from './admin.ts';

export function mintRNFT(chain: Chain, user: Identity, refCode: string, 
                         operator: Identity, uri: string = 'http://no.data.here') {
  const operatorSig = makeSignatureStr(operator.secretKey,
                                       user.publicKey,
                                       [refCode], // refcode is up to 150 utf-8 chars
                                       [uri] // uri is up to 256 ascii chars
                                      );
  return chain.mineBlock([
    
    Tx.contractCall('creature-racer-referral-nft-v5',
                    'mint', [types.utf8(refCode),
                             types.ascii(uri),
                             types.buff(operatorSig.operatorSignature),
                             types.buff(operatorSig.senderPubKey)],
                    user.address)
  ]);
}


export function incrementInvitations(chain: Chain, refcode: string,
                                     invitee: string,
                                     operator: Account) {
  chain.mineBlock([
    Tx.contractCall('creature-racer-referral-nft-v5',
                    'increment-invitations',
                    [types.utf8(refcode),
                     types.principal(invitee)],
                    operator.address)
        ]);
}

export function randomInvites(chain: Chain,
                              amount: number, 
                              refcode: string,
                              operator: Account) {
      for(let i = 0; i < amount; i++) {
        const pk = makeRandomPrivKey();
        const pkstr = privateKeyToString(pk);
        const addr = getAddressFromPrivateKey(pkstr);
        incrementInvitations(chain, refcode, addr, 
                             operator);
      }

}
                              
