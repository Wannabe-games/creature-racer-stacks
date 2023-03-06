import { addSeconds, getUnixTime } from 'https://esm.sh/date-fns';
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { userA, userB, userC,
         getNFTBalance } from './utils/chain.ts';
import { setOperator,
         makeSignature,
         makeRandomIdentity,
       } from './utils/admin.ts';
import { mintCreature, transferCreature, 
         approveTransfer } from './utils/cnft.ts';

const skOperator = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';
const pkOperator = '03cd2cfdbd2ad9332828a7a13ef62cb999e063421c708e863a7ffed71fb61c88c9';
const pkUserA =  '021843d01fa0bb9a3495fd2caf92505a81055dbe1fd545880fd40c3a1c7fd9c40a';
const pkUserB = '02c4b5eacb71a27be633ed970dcbc41c00440364bc04ba38ae4683ac24e708bf33';
 
const nftClass = '.creature-racer-nft-v3.creature-racer-creature-nft';

Clarinet.test({
    name: "Ensure that it refuses mint token with wrong params",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get('deployer')!;
      const operator = accounts.get('wallet_1')!;
      const currentDate = new Date();

      setOperator(chain, deployer, operator);
      
      const userA = accounts.get('wallet_2')!;
      const expiry = getUnixTime(addSeconds(currentDate, 100));
      
      const nftParams = [1, 1, 1, 1, 1, 1, 1, expiry, 100];
      const wrongParams = [1, 1, 1, 1, 1, 1, 1, expiry, 90];

      const sigs = makeSignature(skOperator, pkUserA,
                                  ...nftParams);      
      
      let b1 = chain.mineBlock([
        Tx.contractCall('creature-racer-nft-v3', 'mint',
                        [ types.uint(1),
                          types.buff([1]), 
                          types.buff([1,1,1,1,1]),
                          types.uint(expiry),
                          types.uint(90), 
                          types.buff(sigs.operatorSignature),
                          types.buff(sigs.senderPubKey) ],
                        userA.address),
                        
      ]);
      assertEquals(b1.receipts.length, 1);
      assertEquals(b1.receipts[0].result, '(err u1002)');
    },
});

Clarinet.test({
  name: "Ensure that it returs creature data by passing id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    
    setOperator(chain, deployer, operator);
      
    const userA = accounts.get('wallet_2')!;
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    
    const s1 = makeSignature(skOperator, pkOperator,
                              1, 1, 1, 1, 1, 1, 1, expiry, 0);
    const s2 = makeSignature(skOperator, pkUserA,
                              2, 2, 5, 5, 5, 3, 2, expiry, 1000);
    const s3 = makeSignature(skOperator, pkUserA,
                              3, 21, 4, 4, 4, 4, 4, expiry, 500);
    
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(1),
                        types.buff([1]), 
                        types.buff([1,1,1,1,1]),
                        types.uint(expiry),
                        types.uint(0), 
                        types.buff(s1.operatorSignature),
                        types.buff(s1.senderPubKey) ],
                        operator.address),
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(2),
                        types.buff([2]), 
                        types.buff([5,5,5,3,2]),
                        types.uint(expiry),
                        types.uint(1000), 
                        types.buff(s2.operatorSignature),
                        types.buff(s2.senderPubKey) ],
                        userA.address),
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(3),
                        types.buff([21]), 
                        types.buff([4,4,4,4,4]),
                        types.uint(expiry),
                        types.uint(500), 
                        types.buff(s3.operatorSignature),
                        types.buff(s3.senderPubKey) ],
                        userA.address),
    ]);
    assertEquals(b1.receipts.length, 3);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(ok true)');
    assertEquals(b1.receipts[2].result, '(ok true)');
    
    const c1 = chain.callReadOnlyFn('creature-racer-nft-v3',
                                    'get-creature-data',
                                    [types.uint(1)],
                                    userA.address);
    assertEquals(c1.result, '(ok 0x010101010101)');
    
    const c2 = chain.callReadOnlyFn('creature-racer-nft-v3',
                                    'get-creature-data',
                                    [types.uint(2)],
                                    userA.address);
    assertEquals(c2.result, '(ok 0x020505050302)');
    
    const c3 = chain.callReadOnlyFn('creature-racer-nft-v3',
                                    'get-creature-data',
                                    [types.uint(3)],
                                    userA.address);
    assertEquals(c3.result, '(ok 0x150404040404)');
  }
});

Clarinet.test({
  name: "Ensure that it returns mint cap of creatures",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const userA = accounts.get('wallet_2')!;


    var res = chain.callReadOnlyFn('creature-racer-nft-v3',
                                   'get-mint-cap',
                                   [ types.buff([5,5,5,5,5]) ],
                                   userA.address);
    assertEquals(res.result, '(ok u32)');
    
    res = chain.callReadOnlyFn('creature-racer-nft-v3',
                               'get-mint-cap',
                               [ types.buff([1,1,1,1,1]) ],
                               userA.address);
    assertEquals(res.result, '(ok u100000)');
    
    res = chain.callReadOnlyFn('creature-racer-nft-v3',
                               'get-mint-cap',
                               [ types.buff([5,5,5,2,1]) ],
                               userA.address);
    assertEquals(res.result, '(ok u640)');

    res = chain.callReadOnlyFn('creature-racer-nft-v3',
                               'get-mint-cap',
                               [ types.buff([5,1,3,5,5]) ],
                               userA.address);
    assertEquals(res.result, '(ok u480)');
  }
});

Clarinet.test({
  name: "Ensure that it refuses to mint token when expiry time is invalid",
  async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    
    setOperator(chain, deployer, operator);
      
    const userA = accounts.get('wallet_2')!;

    const sgn = makeSignature(skOperator, pkUserA,
                               33, 16, 5, 5, 5, 5, 5, 0, 0);

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(33),
                        types.buff([16]),
                        types.buff([5,5,5,5,5]),
                        types.uint(0),
                        types.uint(0),
                        types.buff(sgn.operatorSignature),
                        types.buff(sgn.senderPubKey) ],
                      userA.address),
    ]);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(err u7002)');
  }
});

Clarinet.test({
  name: "Ensure that it mints tokens and returns appropriate balances",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    
    setOperator(chain, deployer, operator);
      
    const userA = accounts.get('wallet_2')!;
    const userB = accounts.get('wallet_3')!;
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    
    const s1 = makeSignature(skOperator, pkUserA,
                              1, 1, 1, 1, 1, 1, 1, expiry, 0);
    const s2 = makeSignature(skOperator, pkUserA,
                              2, 2, 5, 5, 5, 3, 2, expiry, 1000);
    const s3 = makeSignature(skOperator, pkUserB,
                              3, 21, 4, 4, 4, 4, 4, expiry, 500);
    
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(1),
                        types.buff([1]), 
                        types.buff([1,1,1,1,1]),
                        types.uint(expiry),
                        types.uint(0), 
                        types.buff(s1.operatorSignature),
                        types.buff(s1.senderPubKey) ],
                        userA.address),
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(2),
                        types.buff([2]), 
                        types.buff([5,5,5,3,2]),
                        types.uint(expiry),
                        types.uint(1000), 
                        types.buff(s2.operatorSignature),
                        types.buff(s2.senderPubKey) ],
                        userA.address),
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(3),
                        types.buff([21]), 
                        types.buff([4,4,4,4,4]),
                        types.uint(expiry),
                        types.uint(500), 
                        types.buff(s3.operatorSignature),
                        types.buff(s3.senderPubKey) ],
                        userB.address),
    ]);
    assertEquals(b1.receipts.length, 3);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(ok true)');
    assertEquals(b1.receipts[2].result, '(ok true)');
    
    const am = chain.getAssetsMaps();
    const nft_addr = ".creature-racer-nft-v3.creature-racer-creature-nft";
    assertEquals(am.assets[nft_addr][userA.address], 2);
    assertEquals(am.assets[nft_addr][userB.address], 1);
  }
});

Clarinet.test({
  name: "Ensure that it refuses to mint when cap is exceeded.",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    const userA = accounts.get('wallet_2')!;
    
    setOperator(chain, deployer, operator);
      
    for(let i = 0; i < 32; i++) {
      const ri = makeRandomIdentity();
      const sigs = makeSignature(skOperator, ri.publicKey,
                                  i, 16, 5, 5, 5, 5, 5,
                                  expiry, 0);
      const args = [ types.uint(i), types.buff([16]),
                          types.buff([5,5,5,5,5]),
                          types.uint(expiry),
                          types.uint(0),
                          types.buff(sigs.operatorSignature),
                          types.buff(sigs.senderPubKey) ];
      const b1 = chain.mineBlock([
        Tx.transferSTX(10, ri.address, operator.address),
        Tx.contractCall('creature-racer-nft-v3', 'mint',
                        args, ri.address)
      ]);

      assertEquals(b1.receipts.length, 2);
      assertEquals(b1.receipts[1].result, '(ok true)');
    }

    const s2 = makeSignature(skOperator, pkUserA,
                              33, 16, 5, 5, 5, 5, 5,
                              expiry, 0);
    const b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(33), types.buff([16]),
                        types.buff([5,5,5,5,5]),
                        types.uint(expiry),
                        types.uint(0),
                        types.buff(s2.operatorSignature),
                        types.buff(s2.senderPubKey) ],
                      userA.address)
    ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(err u7001)');

    for(let i = 0; i < 32; i++) {
      const ri = makeRandomIdentity();
      const sigs = makeSignature(skOperator, ri.publicKey,
                                  i + 32, 4, 5, 5, 5, 5, 5,
                                  expiry, 0);
      const args = [ types.uint(i+32), types.buff([4]),
                     types.buff([5,5,5,5,5]),
                     types.uint(expiry),
                     types.uint(0),
                     types.buff(sigs.operatorSignature),
                     types.buff(sigs.senderPubKey)];
      const b3 = chain.mineBlock([
        Tx.transferSTX(10, ri.address, operator.address),
        Tx.contractCall('creature-racer-nft-v3', 'mint',
                        args, ri.address)
      ]);
      assertEquals(b3.receipts.length, 2);
      assertEquals(b3.receipts[0].result, '(ok true)');
    }

    const s4 = makeSignature(skOperator, pkUserA,
                              80, 4, 5, 5, 5, 5, 5,
                              expiry, 0);
    const b4 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(80), types.buff([4]),
                        types.buff([5,5,5,5,5]),
                        types.uint(expiry),
                        types.uint(0),
                        types.buff(s4.operatorSignature),
                        types.buff(s4.senderPubKey) ],
                      userA.address)
    ]);

    assertEquals(b4.receipts.length, 1);
    assertEquals(b4.receipts[0].result, '(err u7001)');
  }
});

Clarinet.test({
  name: "Ensure that it marks creature as expired after expiration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    const userA = accounts.get('wallet_2')!;
    
    setOperator(chain, deployer, operator);
      
    const sgn = makeSignature(skOperator, pkUserA,
                               123, 4, 3, 3, 3, 5, 2,
                               4, 0);
    const b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(123),
                        types.buff([4]),
                        types.buff([3,3,3,5,2]),
                        types.uint(4),
                        types.uint(0),
                        types.buff(sgn.operatorSignature),
                        types.buff(sgn.senderPubKey) ],
                      userA.address)
    ]);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok true)');

    const b2 = chain.callReadOnlyFn('creature-racer-nft-v3',
                                    'is-expired',
                                    [ types.uint(123) ],
                                    userA.address);
    assertEquals(b2.result, '(ok false)');
    chain.mineEmptyBlockUntil(7);
    const b3 = chain.callReadOnlyFn('creature-racer-nft-v3',
                                    'is-expired',
                                    [ types.uint(123) ],
                                    userA.address);
    assertEquals(b3.result, '(ok true)');
  }
});


Clarinet.test({
  name: "Ensure that only first owner can set royalties",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    const userA = accounts.get('wallet_2')!;
    const userB = accounts.get('wallet_3')!;
    
    setOperator(chain, deployer, operator);
      
    const sgn = makeSignature(skOperator, pkUserA,
                               10, 20, 1, 1, 1, 1, 1,
                               1000, 0);
    const b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-nft-v3', 'mint',
                      [ types.uint(10),
                        types.buff([20]),
                        types.buff([1,1,1,1,1]),
                        types.uint(1000),
                        types.uint(0),
                        types.buff(sgn.operatorSignature),
                        types.buff(sgn.senderPubKey) ],
                      userA.address),
      Tx.contractCall('creature-racer-nft-v3', 'set-royalty',
                      [types.uint(10), types.uint(100)],
                      userB.address)
    ]);
    assertEquals(b1.receipts.length, 2);
    assertEquals(b1.receipts[0].result, '(ok true)');
    assertEquals(b1.receipts[1].result, '(err u403)');
    
  }
});


Clarinet.test({
  name: "Ensure that it reports error when royalties are not set",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const currentDate = new Date();
    const expiry = getUnixTime(addSeconds(currentDate, 100));
    const userA = accounts.get('wallet_2')!;
    const userB = accounts.get('wallet_3')!;
    
    setOperator(chain, deployer, operator);

    const res = chain.callReadOnlyFn('creature-racer-nft-v3',
                                     'royalty-info', 
                                     [types.uint(1),
                                      types.uint(1000)],
                                     userA.address);

    assertEquals(res.result, '(err u404)');
  }
});



Clarinet.test({
  name: "Ensure that owner  can transfer cNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const params = [1, 1, 1, 1, 1, 1, 1, 1000, 0];
    const uA = userA(accounts);
    const uB = userB(accounts);
    const uC = userC(accounts);
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;

    setOperator(chain, deployer, operator);
    const beforeA = getNFTBalance(chain, nftClass, uA.address);
    mintCreature(chain, uA, params);
    const afterA = getNFTBalance(chain, nftClass,  uA.address);
    assertEquals(afterA - beforeA, 1);

    const t0B = getNFTBalance(chain, nftClass, uB.address);
    
    let res = transferCreature(chain, 1, uC, uA, uB);
    const t1A = getNFTBalance(chain, nftClass, uA.address);
    const t1B = getNFTBalance(chain, nftClass, uB.address);

    assertEquals(res, "(err u403)");
    assertEquals(t0B, t1B);
    assertEquals(afterA, t1A);

    res = transferCreature(chain, 1, uA, uA, uB);
    const t2A = getNFTBalance(chain, nftClass, uA.address);
    const t2B = getNFTBalance(chain, nftClass, uB.address);
    assertEquals(res, '(ok true)');
    assertEquals(t2A-t1A, -1);
    assertEquals(t2B-t1B, 1);

    res = transferCreature(chain, 1, uA, uB, uA);
    assertEquals(res, '(err u403)');
  }
});

Clarinet.test({
  name: "Ensure that delegated principal can transfer cNFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const params = [1, 1, 1, 1, 1, 1, 1, 1000, 0];
    const uA = userA(accounts);
    const uB = userB(accounts);
    const uC = userC(accounts);
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;


    setOperator(chain, deployer, operator);
    const beforeA = getNFTBalance(chain, nftClass, uA.address);
    mintCreature(chain, uA, params);
    const afterA = getNFTBalance(chain, nftClass,  uA.address);
    assertEquals(afterA - beforeA, 1);

    const t0B = getNFTBalance(chain, nftClass, uB.address);
    
    approveTransfer(chain, 1, uA, uC.address);

    let res = transferCreature(chain, 1, uC, uA, uB);
    const t1A = getNFTBalance(chain, nftClass, uA.address);
    const t1B = getNFTBalance(chain, nftClass, uB.address);

    assertEquals(res, "(ok true)");
    assertEquals(t0B + 1, t1B);
    assertEquals(afterA - 1, t1A);

    res = transferCreature(chain, 1, uC, uB, uA);
    assertEquals(res, '(err u403)');
  }
});

Clarinet.test({
  name: "Ensure that owner cannot transfer cNFT when staking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const params = [1, 1, 1, 1, 1, 1, 1, 1000, 0];
    const uA = userA(accounts);
    const uB = userB(accounts);

    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    const stakingContract = {
      address: deployer.address + '.creature-racer-staking-v3'
    };

    setOperator(chain, deployer, operator);
    mintCreature(chain, uA, params);
    approveTransfer(chain, 1, uA, stakingContract.address);
    
    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-staking-v3',
                      'enter-staking',
                      [ types.uint(1) ],
                      uA.address)
    ]);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok true)');
    
    let res = transferCreature(chain, 1, uA, stakingContract,
                               uA);
    assertEquals(res, '(err u403)');

    
  }
});
