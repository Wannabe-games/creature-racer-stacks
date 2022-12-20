
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { makeRandomPrivKey,
         privateKeyToString,
         getAddressFromPrivateKey } from 'https://esm.sh/@stacks/transactions';
import { assertEquals, fail } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

import { setOperator } from './utils/admin.ts';
import { mintRNFT, incrementInvitations,
         randomInvites } from './utils/rnft.ts';



function getInvitationsByInvitee(chain: Chain,
                                   user: Account,
                                   operator: Account) {
  return chain.callReadOnlyFn('creature-racer-referral-nft-v1',
                              'get-invitations-by-invitee',
                              [types.principal(user.address)],
                              operator.address).result;
}

function getInvitationsByRefCode(chain: Chain,
                                 refcode: string,
                                 operator: Account) {
  return chain.callReadOnlyFn('creature-racer-referral-nft-v1',
                              'get-invitations-by-ref-code',
                              [types.utf8(refcode)],
                              operator.address).result;
}

Clarinet.test({
  name: "Ensure that referral code cannot be less than 4 unicode characters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let testchr = "\\u{1F37A}";
    let user = accounts.get('wallet_1')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_3')!;

    setOperator(chain, owner, operator);

    let b1 = mintRNFT(chain, user, testchr.repeat(3));
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.height, 3);
    assertEquals(b1.receipts[0].result, '(err u3005)');

    let b2 = mintRNFT(chain, user, testchr.repeat(4));
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.height, 4);
    assertEquals(b2.receipts[0].result, '(ok u1)');
  }
})

Clarinet.test({
  name: "Ensure that referral code cannot be more than 150 unicode characters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let testchr = "\\u{1F37A}";
    let user = accounts.get('wallet_1')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_3')!;

    setOperator(chain, owner, operator);

    let b1 = mintRNFT(chain, user, testchr.repeat(151));
    assertEquals(b1.receipts.length, 0);
    assertEquals(b1.height, 3);

    let b2 = mintRNFT(chain, user, testchr.repeat(150));
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.height, 4);
    assertEquals(b2.receipts[0].result, '(ok u1)');
    
  }
})


Clarinet.test({
  name: "Ensure that user can only mint a single rNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user = accounts.get('wallet_1')!;

    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_3')!;
    setOperator(chain, owner, operator);

    let block = mintRNFT(chain, user, 'ABCDE');

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
    assertEquals(block.receipts[0].result, '(ok u1)');

    block = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'mint', [types.utf8('POELROA')],
                      user.address)
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 4);
    assertEquals(block.receipts[0].result, '(err u3002)');
  }});

Clarinet.test({
  name: "Ensure that referral code can be used only once",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    
    let user1 = accounts.get('wallet_1')!;
    let user2 = accounts.get('wallet_2')!;
    
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_4')!;
    setOperator(chain, owner, operator);
    
    let block = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'mint', [types.utf8('ABCDE')],
                      user1.address),
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'mint', [types.utf8('ABCDE')],
                      user2.address)
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 3);
    assertEquals(block.receipts[0].result, '(ok u1)');
    assertEquals(block.receipts[1].result, '(err u3001)');
  },
});


Clarinet.test({
  name: "Ensure that invitations count is tracked for valid refcode",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let user1 = accounts.get('wallet_1')!;

    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;
    let invitee = accounts.get('wallet_3')!;

    setOperator(chain, owner, operator);
    
    let refcode = 'abcdefg';

    let b1 = mintRNFT(chain, user1, refcode);

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'increment-invitations',
                      [types.utf8(refcode), 
                       types.principal(invitee.address)],
                     operator.address)
    ]);
    assertEquals(getInvitationsByInvitee(chain, invitee, 
                                         operator),
                 '(ok u1)');
    assertEquals(getInvitationsByRefCode(chain, refcode,
                                         operator),
                 '(ok u1)');

  },
});


Clarinet.test({
  name: "Ensure that invitations count is not changed for invalid refcode",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let user1 = accounts.get('wallet_1')!;

    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;
    let invitee = accounts.get('wallet_3')!;

    setOperator(chain, owner, operator);
    
    let refcode = 'asd';

    let b = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'increment-invitations',
                      [types.utf8(refcode), 
                       types.principal(invitee.address)],
                      operator.address)
    ]);
    assertEquals(b.height, 3);
    assertEquals(b.receipts[0].result, '(err u404)');
    assertEquals(getInvitationsByInvitee(chain, invitee, 
                                         operator),
                 '(err u404)');
    assertEquals(getInvitationsByRefCode(chain, refcode,
                                         operator),
                 '(err u404)');

    
  },
});


Clarinet.test({
  name: "Ensure that correct percent of reward is calculated",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user1 = accounts.get('wallet_1')!;
    let user2 = accounts.get('wallet_3')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;
    let refcode = 'testing';

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, user1, refcode);
    
    
    const getPercentageOfRewardBPS = (user: Account) => {
      const res = chain.callReadOnlyFn('creature-racer-referral-nft-v1',
                                       'get-percentage-of-reward-bps',
                                       [types.principal(user.address)],
                                       user1.address);
      return res.result;
    };
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u0)');
    incrementInvitations(chain, refcode, user2.address,
                         operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u100)');

    randomInvites(chain, 24, refcode, operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u500)');
    randomInvites(chain, 50, refcode, operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u1000)');
    randomInvites(chain, 425, refcode, operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u2000)');
    randomInvites(chain, 1001, refcode, operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u4000)');

  },
});


Clarinet.test({
  name: "Ensure that set royalties are settable only for first owner of rNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let user1 = accounts.get('wallet_1')!;
    let user2 = accounts.get('wallet_3')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'set-royalty',
                      [types.uint(1), 
                       types.uint(100)],
                      user2.address)
    ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(err u3004)');
  },  
});



Clarinet.test({
  name: "Ensure that royalties are correctny computed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let user1 = accounts.get('wallet_1')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v1',
                      'set-royalty',
                      [types.uint(1), 
                       types.uint(100)],
                      user1.address)
    ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    let res = chain.callReadOnlyFn('creature-racer-referral-nft-v1',
                                   'royalty-info',
                                   [types.uint(1),
                                    types.uint(10000)],
                                   user1.address);
    assertEquals(res.result,
                 "(ok {amount: u100, receiver: " +
      user1.address + "})");
  },
});

Clarinet.test({
  name: "Ensure that error is reported when  royalties are not set",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let user1 = accounts.get('wallet_1')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let res = chain.callReadOnlyFn('creature-racer-referral-nft-v1',
                                   'royalty-info',
                                   [types.uint(1),
                                    types.uint(10000)],
                                   user1.address);
    assertEquals(res.result,
                 "(err u404)");
  },
});
