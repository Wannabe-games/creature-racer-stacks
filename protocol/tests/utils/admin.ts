import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { pubKeyfromPrivKey, makeRandomPrivKey,
         privateKeyToString,
         getAddressFromPrivateKey } from 'https://esm.sh/@stacks/transactions';

export function setOperator(chain: Chain, deployer: Account, 
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
