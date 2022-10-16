
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals, fail } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that user can only mint a single rNFT",
    async fn(chain: Chain, accounts: Map<string, Account>) {

      let user = accounts.get('wallet_1')!;

      // TODO: access controls and calls restricted to backend
      // address only.
      let owner = accounts.get('deployer')!;
      
      let block = chain.mineBlock([
        Tx.contractCall('creature-racer-referral-nft',
                        'mint', [types.principal(user.address),
                                 types.ascii('ABCDE')],
                       owner.address)
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.height, 2);
      assertEquals(block.receipts[0].result, '(ok u1)');

      block = chain.mineBlock([
        Tx.contractCall('creature-racer-referral-nft',
                        'mint', [types.principal(user.address),
                                 types.ascii('POELROA')],
                       owner.address)
      ]);
      assertEquals(block.receipts.length, 1);
      assertEquals(block.height, 3);
      assertEquals(block.receipts[0].result, '(err u3002)');
    }});

Clarinet.test({
      name: "Ensure that referral code can be used only once",
      async fn(chain: Chain, accounts: Map<string, Account>) {
        fail("not implemented")
      },
    });
