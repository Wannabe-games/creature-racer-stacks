import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';


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

// Returns STX balance of account with given stacks address.
export function getBalance(chain: Chain, account: string) {
  const balance = chain.getAssetsMaps().assets.STX[account];
  if(!balance)
    return 0;
  else
    return balance;
}

