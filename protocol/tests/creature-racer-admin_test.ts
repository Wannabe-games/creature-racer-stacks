
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { makeSignature, setOperator } from './utils/admin.ts';

Clarinet.test({
    name: "Ensure that it verifies correct signatures",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      let owner = accounts.get('deployer')!;
      let operator = accounts.get('wallet_1')!
      let opseckey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
      let sender = accounts.get('wallet_2')!;
      let senderpubkey = '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';

      setOperator(chain, owner, operator);

      const sig = makeSignature(opseckey, senderpubkey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin-v3',
                        'verify-signature',
                        [types.buff(sig.operatorSignature),
                         types.buff(sig.senderPubKey),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        sender.address
                       )
      ]);
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
      let senderpubkey = '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';

      setOperator(chain, owner, operator);

      const sigs = makeSignature(opseckey, senderpubkey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin-v3',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderPubKey),
                         types.list([types.uint(500),
                                     types.uint(531100)])],
                        sender.address
                       )
      ]);
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
      let senderpubkey = '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';

      setOperator(chain, owner, operator);

      const sigs = makeSignature(opseckey, senderpubkey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin-v3',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderPubKey),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        accounts.get('wallet_3')!.address
                       )
      ]);
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
      let senderpubkey = '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';

      setOperator(chain, owner, accounts.get('wallet_5')!);

      const sigs = makeSignature(opseckey, senderpubkey, 
                                  // call arguments follow
                                  500, 531101);
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-admin-v3',
                        'verify-signature',
                        [types.buff(sigs.operatorSignature),
                         types.buff(sigs.senderPubKey),
                         types.list([types.uint(500),
                                     types.uint(531101)])],
                        sender.address
                       )
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.receipts[0].result, '(err u1002)');
    }
});
