
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { setOperator,
         makeSignature } from './utils/admin.ts';
import { Identity } from './utils/admin.ts';
import { getBalance, userA } from './utils/chain.ts';


Clarinet.test({
  name: "Ensure that it allows to use signature once",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const skOperator = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
    setOperator(chain, deployer, operator);
    const uA = userA(accounts);
    const poolAddr = deployer.address + 
      '.creature-racer-referral-pool-v2';

    let b1 = chain.mineBlock([
      Tx.transferSTX(200, poolAddr, operator.address)
    ]);
    assertEquals(b1.receipts.length, 1);

    const before = getBalance(chain, uA.address);
    const sigs = makeSignature(skOperator, uA.publicKey,
                                1,1);
    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-pool-v2',
                      'withdraw',
                      [ types.buff(sigs.operatorSignature),
                        types.buff(sigs.senderPubKey),
                        types.uint(1), types.uint(1) ],
                      uA.address)
    ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    const after = getBalance(chain, uA.address);
    
    assertEquals(after - before, 1);
    let b3 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-pool-v2',
                      'withdraw',
                      [ types.buff(sigs.operatorSignature),
                        types.buff(sigs.senderPubKey),
                        types.uint(1), types.uint(1) ],
                      uA.address)
    ]);
    assertEquals(b3.receipts.length, 1);
    assertEquals(b3.receipts[0].result, '(err u6001)');

  }
});
