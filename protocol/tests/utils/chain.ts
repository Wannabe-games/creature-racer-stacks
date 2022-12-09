import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { pubKeyfromPrivKey, publicKeyToString } from 'https://esm.sh/@stacks/transactions';

// Return NFT balance of given NFT class on account which
// address is given.
export function getNFTBalance(chain: Chain, nftClass: string,
                              account: string) {
  const balance = chain.getAssetsMaps().assets[nftClass][account];
  if(!balance)
    return 0;
  else
    return balance;
}


export function userA(accounts: Map<string, Account>): Identity {
  const userA = accounts.get('wallet_2')!;
  const idA: Identity = {
    address: userA.address,
    secretKey: '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101',
    publicKey: publicKeyToString(pubKeyfromPrivKey('530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101'))
  };
  return idA;
}

export function userB(accounts: Map<string, Account>): Identity {
  const userB = accounts.get('wallet_3')!;
  const idB: Identity = {
    address: userB.address,
    secretKey: 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901',
    publicKey: publicKeyToString(pubKeyfromPrivKey('d655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901'))
  };
  return idB;

}



// Returns STX balance of account with given stacks address.
export function getBalance(chain: Chain, account: string) {
  const balance = chain.getAssetsMaps().assets.STX[account];
  if(!balance)
    return 0;
  else
    return balance;
}

