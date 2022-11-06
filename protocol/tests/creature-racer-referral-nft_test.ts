
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals, fail } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { pubKeyfromPrivKey, makeRandomPrivKey,
         privateKeyToString,
         getAddressFromPrivateKey } from 'https://esm.sh/@stacks/transactions';

function mintToken(chain: Chain, user: Account, refCode: string,
                   caller: Account) {
  return chain.mineBlock([
    Tx.contractCall('creature-racer-referral-nft',
                    'mint', [types.principal(user.address),
                             types.ascii(refCode)],
                   caller.address)
  ]);
}

function setOperator(chain: Chain, deployer: Account, 
                     operator: Account) {
  let secretKey = 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901';
  let publicKey = pubKeyfromPrivKey(secretKey);
  let block = chain.mineBlock([
    Tx.contractCall('creature-racer-admin',
                    'set-operator', 
                    [types.some(types.principal(operator.address)),
                     types.some(types.buff(publicKey))],
                    deployer.address)
  ]);
  assertEquals(block.receipts.length, 1);
  assertEquals(block.receipts[0].result, '(ok true)');
}

function getInvitationsByInvitee(chain: Chain,
                                   user: Account,
                                   operator: Account) {
  return chain.callReadOnlyFn('creature-racer-referral-nft',
                              'get-invitations-by-invitee',
                              [types.principal(user.address)],
                              operator.address).result;
}

function getInvitationsByRefCode(chain: Chain,
                                 refcode: string,
                                 operator: Account) {
  return chain.callReadOnlyFn('creature-racer-referral-nft',
                              'get-invitations-by-ref-code',
                              [types.ascii(refcode)],
                              operator.address).result;
}

Clarinet.test({
  name: "Ensure that user can only mint a single rNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user = accounts.get('wallet_1')!;

    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_3')!;
    setOperator(chain, owner, operator);

    let block = mintToken(chain, user, 'ABCDE', operator);

    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
    assertEquals(block.receipts[0].result, '(ok u1)');

    block = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
                      'mint', [types.principal(user.address),
                               types.ascii('POELROA')],
                      operator.address)
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
      Tx.contractCall('creature-racer-referral-nft',
                      'mint', [types.principal(user1.address),
                               types.ascii('ABCDE')],
                      operator.address),
      Tx.contractCall('creature-racer-referral-nft',
                      'mint', [types.principal(user2.address),
                               types.ascii('ABCDE')],
                      operator.address)
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 3);
    assertEquals(block.receipts[0].result, '(ok u1)');
    assertEquals(block.receipts[1].result, '(err u3001)');
  },
});

Clarinet.test({
  name: "Operator needs to be set to mint rNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user1 = accounts.get('wallet_1')!;          

    let owner = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
                      'mint', [types.principal(user1.address),
                               types.ascii('ABCDE')],
                      owner.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    assertEquals(block.receipts[0].result, '(err u1001)');
  },
});

Clarinet.test({
  name: "Only operator can mint rNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user1 = accounts.get('wallet_1')!;

    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;
    setOperator(chain, owner, operator);
    
    let block = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
                      'mint', [types.principal(user1.address),
                               types.ascii('ABCDE')],
                      owner.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
    assertEquals(block.receipts[0].result, '(err u403)');
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

    let b1 = mintToken(chain, user1, refcode, operator);

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
                      'increment-invitations',
                      [types.ascii(refcode), 
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
      Tx.contractCall('creature-racer-referral-nft',
                      'increment-invitations',
                      [types.ascii(refcode), 
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

function incrementInvitations(chain: Chain, refcode: string,
                              invitee: string,
                             operator: Account) {
  chain.mineBlock([
    Tx.contractCall('creature-racer-referral-nft',
                    'increment-invitations',
                    [types.ascii(refcode),
                     types.principal(invitee)],
                    operator.address)
        ]);
}


Clarinet.test({
  name: "Ensure that correct percent of reward is calculated",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let user1 = accounts.get('wallet_1')!;
    let user2 = accounts.get('wallet_3')!;
    let owner = accounts.get('deployer')!;
    let operator = accounts.get('wallet_2')!;
    let refcode = 'testing';

    setOperator(chain, owner, operator);
    let b1 = mintToken(chain, user1, refcode, operator);
   
    const increment = (amount: number) => {
      for(let i = 0; i < amount; i++) {
        const pk = makeRandomPrivKey();
        const pkstr = privateKeyToString(pk);
        const addr = getAddressFromPrivateKey(pkstr);
        incrementInvitations(chain, refcode, addr, 
                             operator);
      }
    };
    
    const getPercentageOfRewardBPS = (user: Account) => {
      const res = chain.callReadOnlyFn('creature-racer-referral-nft',
                                       'get-percentage-of-reward-bps',
                                       [types.principal(user.address)],
                                       user1.address);
      return res.result;
    };
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u0)');
    incrementInvitations(chain, refcode, user2.address,
                         operator);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u100)');

    increment(24);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u500)');
    increment(50);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u1000)');
    increment(425);
    assertEquals(getPercentageOfRewardBPS(user2), '(ok u2000)');
    increment(1001);
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
    let b1 = mintToken(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
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
    let b1 = mintToken(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft',
                      'set-royalty',
                      [types.uint(1), 
                       types.uint(100)],
                      user1.address)
    ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    let res = chain.callReadOnlyFn('creature-racer-referral-nft',
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
    let b1 = mintToken(chain, user1, 'asdc', operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');
    
    let res = chain.callReadOnlyFn('creature-racer-referral-nft',
                                   'royalty-info',
                                   [types.uint(1),
                                    types.uint(10000)],
                                   user1.address);
    assertEquals(res.result,
                 "(err u404)");
  },
});
