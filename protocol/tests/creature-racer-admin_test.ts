
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { makeSignatures, setOperator } from './utils/admin.ts';

Clarinet.test({
    name: "Ensure that it verifies correct signatures",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let owner = accounts.get('deployer')!;
      let operator = accounts.get('wallet_1')!
      let opseckey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
      let sender = accounts.get('wallet_2')!;
      let senderseckey = '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101';

      setOperator(chain, owner, operator);

      const sigs = makeSignatures(opseckey, senderseckey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderSignature),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        sender.address
                       )
      ]);
      assertEquals(block.height, 3);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, '(ok true)');
    }
});


Clarinet.test({
    name: "Ensure that it rejects invalid signatures",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let owner = accounts.get('deployer')!;
      let operator = accounts.get('wallet_1')!
      let opseckey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
      let sender = accounts.get('wallet_2')!;
      let senderseckey = '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101';

      setOperator(chain, owner, operator);

      const sigs = makeSignatures(opseckey, senderseckey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderSignature),
                         types.list([types.uint(500),
                                     types.uint(531100)])],
                        sender.address
                       )
      ]);
      assertEquals(block.height, 3);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, '(err u1002)');
    }
});



Clarinet.test({
    name: "Ensure that it verifies sender principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let owner = accounts.get('deployer')!;
      let operator = accounts.get('wallet_1')!
      let opseckey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
      let sender = accounts.get('wallet_2')!;
      let senderseckey = '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101';

      setOperator(chain, owner, operator);

      const sigs = makeSignatures(opseckey, senderseckey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderSignature),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        accounts.get('wallet_3')!.address
                       )
      ]);
      assertEquals(block.height, 3);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, '(err u1002)');
    }
});

Clarinet.test({
    name: "Ensure that it verifies operator principal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let owner = accounts.get('deployer')!;
      let operator = accounts.get('wallet_1')!
      let opseckey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
      let sender = accounts.get('wallet_2')!;
      let senderseckey = '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101';

      setOperator(chain, owner, accounts.get('wallet_5')!);

      const sigs = makeSignatures(opseckey, senderseckey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderSignature),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        sender.address
                       )
      ]);
      assertEquals(block.height, 3);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, '(err u1002)');
    }
});
