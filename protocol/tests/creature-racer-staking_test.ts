
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

import { setOperator, 
         makeSignature } from './utils/admin.ts';
import { Identity } from './utils/admin.ts';
import { getNFTBalance, userA, userB } from './utils/chain.ts';
import { mintCreature } from './utils/cnft.ts';

const nftClass = '.creature-racer-nft-v4.creature-racer-creature-nft';



function getUserShare(chain: Chain, user: Identity) {
    
  const share = 
      chain.callReadOnlyFn('creature-racer-staking-v4',
                           'get-user-share',
                           [ types.principal(user.address) ],
                           user.address);
    const res = share.result;
    const rx = /ok u([0-9]+)/;
    
    var r = res.match(rx);
  return parseInt(r[1]);
}

function getTotalShare(chain: Chain, user: Identity) {
    
  const share = 
      chain.callReadOnlyFn('creature-racer-staking-v4',
                           'get-total-share',
                           [ ],
                           user.address);
    const res = share.result;
    const rx = /ok u([0-9]+)/;
    
    var r = res.match(rx);
  return parseInt(r[1]);
}


Clarinet.test({
    name: "Ensure that it rejects attempt to stake when user has no creature to stake",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const uA = userA(accounts);
    const uB = userB(accounts);
    const nftParams = [1, 1, 1, 1, 1, 1, 1, 100, 0];
    mintCreature(chain, uB, nftParams);
    
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-staking-v4', 'enter-staking',
                      [ types.uint(1) ],
                      uA.address)
    ]);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(err u8001)');
  },
});


Clarinet.test({
  name: "Ensure that it rejects attempt to stake when user didn't approve creature to stake",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const uA = userA(accounts);
    const uB = userB(accounts);
    const nftParams = [1, 1, 1, 1, 1, 1, 1, 100, 0];
    mintCreature(chain, uA, nftParams);
    
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-staking-v4', 'enter-staking',
                      [ types.uint(1) ],
                      uA.address)
    ]);

    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(err u403)');
  },
});


Clarinet.test({
    name: "Ensure that it allows user to stake creature",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const uA = userA(accounts);
    const uB = userB(accounts);
    const nftParams = [1, 7, 1, 4, 3, 5, 4, 100, 1000];
    mintCreature(chain, uA, nftParams);
      
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v4',
                      'set-approved-for-all',
                      [ types.principal(deployer.address +
                        '.creature-racer-staking-v4'),
                        types.bool(true) ],
                      uA.address),
      Tx.contractCall('creature-racer-staking-v4', 'enter-staking',
                      [ types.uint(1) ],
                      uA.address)
    ]);
    
    assertEquals(b1.receipts.length, 2);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(ok true)');

    const userAShare = getUserShare(chain, uA);
    const totalShare = getTotalShare(chain, uA);

    let scRes = chain.callReadOnlyFn('creature-racer-staking-v4',
                                     'get-staked-creatures',
                                     [ types.principal(uA.address),
                                       types.uint(1) ],
                                     uA.address);
    assertEquals(scRes.result, '(ok u1)');
    assertEquals(userAShare, 346494997534);
    assertEquals(totalShare, 346494997534)
  },
});

const creatures = [
  { data: [7, 4, 1, 3, 4, 2], weight: 400742941786 },
  { data: [16, 3, 5, 4, 4, 3], weight: 2723307049292 },
  { data: [14, 4, 1, 2, 1, 4], weight: 1456356755882 },
  { data: [15, 1, 3, 2, 5, 2], weight: 1506505340991 },
  { data: [17, 3, 3, 5, 1, 4], weight: 2130386823807 },
];

creatures.forEach(creature => {
  Clarinet.test({
    name: `Ensure that it calculates weight for creature [${creature.data[0]} ${creature.data[1]} ${creature.data[2]} ${creature.data[3]} ${creature.data[4]} ${creature.data[5]}`,
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const nftParams = [
        1,
        creature.data[0],
        creature.data[1],
        creature.data[2],
        creature.data[3],
        creature.data[4],
        creature.data[5],
        10000,
        0,
      ] as const;
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const uB = userB(accounts);
      mintCreature(chain, uA, nftParams);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 'enter-staking',
                        [ types.uint(1) ],
                        uA.address)
      ]);
      
      assertEquals(b1.receipts.length, 2);
      assertEquals(b1.receipts[0].result, '(ok true)');
      assertEquals(b1.receipts[1].result, '(ok true)');

      const userAShare = getUserShare(chain, uA);
      assertEquals(userAShare, creature.weight);
    }
  });
});


Clarinet.test({
    name: "Ensure that it allows user to leave staking",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const nftParams = [1, 1, 1, 1, 1, 1, 1, 1000, 0] as const;
      mintCreature(chain, uA, nftParams);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'enter-staking',
                        [ types.uint(1) ],
                        uA.address)
      ]);
      
      assertEquals(b1.receipts.length, 2);
      assertEquals(b1.receipts[0].result, '(ok true)');
      assertEquals(b1.receipts[1].result, '(ok true)');
 
      let scRes = chain.callReadOnlyFn('creature-racer-staking-v4',
                                       'get-staked-creatures',
                                       [ types.principal(uA.address),
                                         types.uint(1) ],
                                       uA.address);
      assertEquals(scRes.result, '(ok u1)');

      const stakingContractAddr = deployer.address + 
        '.creature-racer-staking-v4';
      const stakingBalance = getNFTBalance(chain, nftClass,
                                           stakingContractAddr);
      const uABalance = getNFTBalance(chain, nftClass, 
                                      uA.address);
      assertEquals(stakingBalance, 1);
      assertEquals(uABalance, 0);
      
      let b2 = chain.mineBlock([
        Tx.contractCall('creature-racer-staking-v4',
                        'open-new-cycle',
                        [ ],
                        operator.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'leave-staking',
                        [ types.uint(1) ],
                        uA.address)
      ]);
      
      assertEquals(b2.receipts.length, 2);
      assertEquals(b2.receipts[0].result, '(ok true)');
      assertEquals(b2.receipts[1].result, '(ok true)');

      let scRes2 = chain.callReadOnlyFn('creature-racer-staking-v4',
                                        'get-staked-creatures',
                                        [ types.principal(uA.address),
                                          types.uint(1) ],
                                        uA.address);
      assertEquals(scRes2.result, '(ok u0)');
      const stakingBalanceAfter = getNFTBalance(chain, nftClass,
                                                stakingContractAddr);
      const uABalanceAfter = getNFTBalance(chain, nftClass, 
                                           uA.address);
      assertEquals(stakingBalanceAfter, 0);
      assertEquals(uABalanceAfter, 1);      
    },
});


Clarinet.test({
    name: "Ensure that it rejects leave staking request when there is no creatures to withdraw",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-staking-v4', 
                        'leave-staking',
                        [ types.uint(123) ],
                        uA.address)
      ]);
      
      assertEquals(b1.receipts.length, 1);
      assertEquals(b1.receipts[0].result, '(err u8003)');
    },
});


Clarinet.test({
    name: "Ensure that it rejects leave staking request when creature is locked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const nftParams = [1, 1, 1, 1, 1, 1, 1, 1000, 0] as const;
      mintCreature(chain, uA, nftParams);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'enter-staking',
                        [ types.uint(1) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'leave-staking',
                        [ types.uint(1) ],
                        uA.address)
      ]);
      
      assertEquals(b1.receipts.length, 3);
      assertEquals(b1.receipts[0].result, '(ok true)');
      assertEquals(b1.receipts[1].result, '(ok true)');
      assertEquals(b1.receipts[2].result, '(err u8002)');
    },
});


Clarinet.test({
    name: "Ensure that it rejects creature burning when caller has no permissions",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const nftParams = [1, 1, 1, 1, 1, 1, 1, 1000, 0] as const;
      mintCreature(chain, uA, nftParams);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'enter-staking',
                        [ types.uint(1) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'remove-expired-creature',
                        [ types.principal(uA.address),
                          types.uint(1) ],
                        uA.address)
      ]);
      
      assertEquals(b1.receipts.length, 3);
      assertEquals(b1.receipts[2].result, '(err u403)');
    },
});


Clarinet.test({
    name: "Ensure that it removes expired creature",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const nftParams = [1, 1, 1, 1, 1, 1, 1, 1000, 0] as const;
      const stakingContractAddr = deployer.address + 
        '.creature-racer-staking-v4';

      mintCreature(chain, uA, nftParams);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'enter-staking',
                        [ types.uint(1) ],
                        uA.address),
      ]);
      
      assertEquals(b1.receipts.length, 2);
      assertEquals(b1.receipts[0].result, '(ok true)');
      assertEquals(b1.receipts[1].result, '(ok true)');

      const stakingBalanceBefore = getNFTBalance(chain, nftClass,
                                                 stakingContractAddr);
      assertEquals(stakingBalanceBefore, 1);

      
      let b2 = chain.mineBlock([
        Tx.contractCall('creature-racer-staking-v4', 
                        'remove-expired-creature',
                        [ types.principal(uA.address), 
                          types.uint(1) ],
                        operator.address),
      ]);
      assertEquals(b2.receipts.length, 1);
      assertEquals(b2.receipts[0].result, '(ok true)');
      const stakingBalanceAfter = getNFTBalance(chain, nftClass,
                                                stakingContractAddr);
      assertEquals(stakingBalanceAfter, 0);

      const userAShare = getUserShare(chain, uA);
      const totalShare = getTotalShare(chain, uA);

      assertEquals(userAShare, 0);
      assertEquals(totalShare, 0);

    },
});


Clarinet.test({
    name: "Ensure that it rejects attempt to stake expired creature",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      setOperator(chain, deployer, operator);
      const uA = userA(accounts);
      const nftParams = [1, 1, 1, 1, 1, 1, 1, 4, 0] as const;

      mintCreature(chain, uA, nftParams);

      chain.mineEmptyBlock(5);
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v4',
                        'set-approved-for-all',
                        [ types.principal(deployer.address +
                          '.creature-racer-staking-v4'),
                          types.bool(true) ],
                        uA.address),
        Tx.contractCall('creature-racer-staking-v4', 
                        'enter-staking',
                        [ types.uint(1) ],
                        uA.address),
      ]);
      
      assertEquals(b1.receipts.length, 2);
      assertEquals(b1.receipts[0].result, '(ok true)');
      assertEquals(b1.receipts[1].result, '(err u419)');

    },
});
