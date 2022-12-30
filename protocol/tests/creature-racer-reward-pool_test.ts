
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.5/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { setOperator,
         makeSignature } from './utils/admin.ts';

const skOperator = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
const pkOperator ='03cd2cfdbd2ad9332828a7a13ef62cb999e063421c708e863a7ffed71fb61c88c9'; 
const pkUserA = '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';

Clarinet.test({
  name: "Ensure that it returns error when there is no funds to withdraw",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const userA = accounts.get('wallet_2')!;
    const sigs = makeSignature(skOperator, pkUserA,
                                10, 1, 0);
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'withdraw',
                      [ types.buff(sigs.operatorSignature),
                        types.buff(sigs.senderPubKey),
                        types.uint(10), types.uint(1),
                        types.uint(0)],
                      userA.address)
    ]);
    assertEquals(b1.height, 3);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(err u2002)');
  },
});

Clarinet.test({
  name: "Ensure that it returns error when invalid withdrawal count is passed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const userA = accounts.get('wallet_2')!;
    const sigs = makeSignature(skOperator, pkUserA,
                                10, 2, 0);
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [ types.uint(10) ],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'withdraw',
                      [ types.buff(sigs.operatorSignature),
                        types.buff(sigs.senderPubKey),
                        types.uint(10), types.uint(2),
                        types.uint(0)],
                      userA.address)
    ]);
    assertEquals(b1.height, 3);
    assertEquals(b1.receipts.length, 2);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(err u6001)');
  },
});


Clarinet.test({
  name: "Ensure that it calculates funds for cycles",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    setOperator(chain, deployer, operator);
    const userA = accounts.get('wallet_2')!;

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [types.uint(2000)],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(0)], userA.address)
    ]);

    assertEquals(b1.height, 3);
    assertEquals(b1.receipts.length, 3);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(ok u2000)');
    assertEquals(b1.receipts[2].result, '(ok u2000)');

    const openNewCycle = function() {
      let b = chain.mineBlock([
        Tx.contractCall('creature-racer-reward-pool-v2',
                        'open-new-cycle', [],
                        operator.address)
      ]);
      assertEquals(b.receipts.length, 1);
      assertEquals(b.receipts[0].result, '(ok true)');
      return b;
    };

    openNewCycle(); // 1
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [ types.uint(2000) ],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(1)], userA.address)
    ]);
    assertEquals(b2.height, 5);
    assertEquals(b2.receipts.length, 3);
    assertEquals(b2.receipts[0].result, '(ok true)');
    assertEquals(b2.receipts[1].result, '(ok u4000)');
    assertEquals(b2.receipts[2].result, '(ok u2000)');
    
    openNewCycle(); // 2
    openNewCycle(); // 3

    let b3 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [ types.uint(2000) ],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(2)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(3)], userA.address)
    ]);
    assertEquals(b3.height, 8);
    assertEquals(b3.receipts.length, 4);
    assertEquals(b3.receipts[0].result, '(ok true)');
    assertEquals(b3.receipts[1].result, '(ok u6000)');
    assertEquals(b3.receipts[2].result, '(ok u0)');
    assertEquals(b3.receipts[3].result, '(ok u2000)');

    
    openNewCycle(); // 4
    openNewCycle(); // 5

    let b4 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [ types.uint(2000) ],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(4)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(5)], userA.address)
    ]);
    assertEquals(b4.height, 11);
    assertEquals(b4.receipts.length, 4);
    assertEquals(b4.receipts[0].result, '(ok true)');
    assertEquals(b4.receipts[1].result, '(ok u8000)');
    assertEquals(b4.receipts[2].result, '(ok u0)');
    assertEquals(b4.receipts[3].result, '(ok u2000)');
    
    openNewCycle(); // 6
    openNewCycle(); // 7

    let b5 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'receive-funds',
                      [ types.uint(2000) ],
                      operator.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(6)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(7)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(0)], userA.address)
    ]);
    assertEquals(b5.height, 14);
    assertEquals(b5.receipts.length, 5);
    assertEquals(b5.receipts[0].result, '(ok true)');
    assertEquals(b5.receipts[1].result, '(ok u10000)');
    assertEquals(b5.receipts[2].result, '(ok u0)');
    assertEquals(b5.receipts[3].result, '(ok u4000)');
    // +2 from first cycle
    assertEquals(b5.receipts[4].result, '(ok u0)');
    

    const withdrawalSigs = makeSignature(skOperator,
                                          pkUserA,
                                          1500, 1, 1);
    let b6 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'withdraw',
                      [ types.buff(withdrawalSigs.operatorSignature),
                        types.buff(withdrawalSigs.senderPubKey),
                        types.uint(1500),
                        types.uint(1),
                        types.uint(1) ],
                      userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(1)], userA.address),
    ]);
    assertEquals(b6.height, 15);
    assertEquals(b6.receipts.length, 2);
    assertEquals(b6.receipts[0].result, '(ok true)');
    assertEquals(b6.receipts[1].result, '(ok u500)');

    openNewCycle(); // 8
    openNewCycle(); // 9

    let b7 = chain.mineBlock([
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-balance', [ ],
                      userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(8)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(9)], userA.address),
      Tx.contractCall('creature-racer-reward-pool-v2',
                      'get-cycle-balance',
                      [types.uint(1)], userA.address),
    ]);
    assertEquals(b7.height, 18);
    assertEquals(b7.receipts.length, 4);
    assertEquals(b7.receipts[0].result, '(ok u8500)');
    assertEquals(b7.receipts[1].result, '(ok u500)');
    assertEquals(b7.receipts[2].result, '(ok u0)');
    assertEquals(b7.receipts[3].result, '(ok u0)');
  },
});

