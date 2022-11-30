
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { setOperator, 
         makeSignatures } from './utils/admin.ts';
import { Identity } from './utils/admin.ts';

function mintCreature(chain: Chain, user: Identity,
                     nftParams: []) {
  const skOperator = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
   
  const sigs = makeSignatures(skOperator, user.secretKey,
                              ...nftParams);
  let b = chain.mineBlock([
    Tx.contractCall('creature-racer-nft', 'mint',
                    [ types.uint(nftParams[0]),
                      types.buff([nftParams[1]]),
                      types.buff([nftParams[2],nftParams[3],
                                  nftParams[4],nftParams[5],
                                  nftParams[6]]),
                      types.uint(nftParams[7]),
                      types.uint(nftParams[8]),
                      types.buff(sigs.operatorSignature),
                      types.buff(sigs.senderSignature) ],
                    user.address)
  ]);
  assertEquals(b.receipts.length, 1);
  assertEquals(b.receipts[0].result, '(ok true)');
}

function userA(accounts: Map<string, Account>): Identity {
  const userA = accounts.get('wallet_2')!;
  const idA: Identity = {
    address: userA.address,
    secretKey: '530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc209101'
  };
  return idA;
}

function userB(accounts: Map<string, Account>): Identity {
  const userB = accounts.get('wallet_3')!;
  const idB: Identity = {
    address: userB.address,
    secretKey: 'd655b2523bcd65e34889725c73064feb17ceb796831c0e111ba1a552b0f31b3901'
  };
  return idB;

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
      Tx.contractCall('creature-racer-staking', 'enter-staking',
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
    },
});


Clarinet.test({
    name: "Ensure that it allows user to stake creature",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});

Clarinet.test({
    name: "Ensure that it allows user to leave staking",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});


Clarinet.test({
    name: "Ensure that it rejects leave staking request when there is no creatures to withdraw",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});


Clarinet.test({
    name: "Ensure that it rejects leave staking request when creature is locked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});


Clarinet.test({
    name: "Ensure that it rejects creature burning when caller has no permissions",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});


Clarinet.test({
    name: "Ensure that it removes expired creature",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});


Clarinet.test({
    name: "Ensure that it rejects attempt to stake expired creature",
    async fn(chain: Chain, accounts: Map<string, Account>) {
    },
});
