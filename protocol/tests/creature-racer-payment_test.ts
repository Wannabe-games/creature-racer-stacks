
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

import { setOperator } from './utils/admin.ts';
import { mintRNFT, incrementInvitations,
         randomInvites } from './utils/rnft.ts';
import { getBalance } from './utils/chain.ts';

Clarinet.test({
  name: "Ensure that funds are sent to operator of reward pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let owner = accounts.get('deployer')!;
    let userA = accounts.get('wallet_1')!;
    let operator = accounts.get('wallet_5')!;
    let supportedWallet = accounts.get('wallet_6')!;

    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v3';

    setOperator(chain, owner, operator);

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
    ]);

    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok none)');

    const operatorBalanceBefore = getBalance(chain, operator.address);
    const rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    const supportedBalanceBefore = getBalance(chain, supportedWallet.address);

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(1000)],
                     userA.address)
     ]);
      assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    const operatorBalanceAfter = getBalance(chain, operator.address);
    const rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    const supportedBalanceAfter = getBalance(chain, supportedWallet.address);
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 100);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore,
                 450);
    assertEquals(supportedBalanceAfter - supportedBalanceBefore,
                 450);
  }
});

Clarinet.test({
  name: "Ensure that portion for operator is set",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let owner = accounts.get('deployer')!;
    let userA = accounts.get('wallet_1')!;
    let operator = accounts.get('wallet_5')!;
    let supportedWallet = accounts.get('wallet_6')!;

    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v3';

    setOperator(chain, owner, operator);

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'set-portion-for-operator',
                      [types.uint(2)],
                     owner.address),
      Tx.contractCall('creature-racer-payment-v3',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
    ]);

    assertEquals(b1.receipts.length, 2);
    assertEquals(b1.receipts[0].result, '(ok u100)');
    assertEquals(b1.receipts[1].result, '(ok none)');

    const operatorBalanceBefore = getBalance(chain, operator.address);
    const rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    const supportedBalanceBefore = getBalance(chain, supportedWallet.address);

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(10)],
                     userA.address)
     ]);
      assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    const operatorBalanceAfter = getBalance(chain, operator.address);
    const rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    const supportedBalanceAfter = getBalance(chain, supportedWallet.address);
    
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 2);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore,
                 4);
    assertEquals(supportedBalanceAfter - supportedBalanceBefore,
                 4);
  }
});

Clarinet.test({
  name: "Ensure that it sends fund to the referral pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let refcode = 'abcd';

    let owner = accounts.get('deployer')!;
    let userA = accounts.get('wallet_1')!;
    let userB = accounts.get('wallet_2')!;
    let operator = accounts.get('wallet_5')!;
    let supportedWallet = accounts.get('wallet_6')!;

    const paymentContractAddress = owner.address + '.creature-racer-payment-v3';
    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v3';
    const referralPoolAddress = owner.address + '.creature-racer-referral-pool-v3';

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, userA, refcode, operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');


    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
      Tx.contractCall('creature-racer-referral-nft-v3',
                      'increment-invitations',
                      [types.utf8(refcode),
                       types.principal(owner.address)],
                     operator.address)
    ]);

    assertEquals(b2.receipts.length, 2);
    assertEquals(b2.receipts[0].result, '(ok none)');
    assertEquals(b2.receipts[1].result, '(ok true)');

    let operatorBalanceBefore = getBalance(chain, operator.address);
    let rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    let referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    let supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
    
    let b3 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(100100)],
                      owner.address)
    ]);

    assertEquals(b3.receipts.length, 1);
    assertEquals(b3.receipts[0].result, '(ok true)');

    let operatorBalanceAfter = getBalance(chain, operator.address);
    let rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    let referralPoolBalanceAfter = getBalance(chain, referralPoolAddress);
    let supportedWalletBalanceAfter = getBalance(chain, supportedWallet.address);

    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 100);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 49500);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 1000);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 49500);

    randomInvites(chain, 24, refcode, operator);

    operatorBalanceBefore = getBalance(chain, operator.address);
    rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
  
    let b4 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(100100)],
                      owner.address)
    ]);

    assertEquals(b4.receipts.length, 1);
    assertEquals(b4.receipts[0].result, '(ok true)');

    operatorBalanceAfter = getBalance(chain, operator.address);
    rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceAfter = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceAfter = getBalance(chain, supportedWallet.address);
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 100);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 47500);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 47500);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 5000);

    let b5 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v3',
                      'set-referral-to-receiving-fixed-bonus',
                      [types.utf8(refcode)],
                      operator.address)
    ]);
    assertEquals(b5.receipts.length, 1);
    assertEquals(b5.receipts[0].result, '(ok true)');


    operatorBalanceBefore = getBalance(chain, operator.address);
    rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
  
    let b6 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(100100)],
                      owner.address)
    ]);
    assertEquals(b6.receipts.length, 1);
    assertEquals(b6.receipts[0].result, '(ok true)');

    operatorBalanceAfter = getBalance(chain, operator.address);
    rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceAfter = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceAfter = getBalance(chain, supportedWallet.address);
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 100);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 47375);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 47375);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 5250);


    operatorBalanceBefore = getBalance(chain, operator.address);
    rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
  
  
    let b7 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(100100)],
                      owner.address)
    ]);
    assertEquals(b7.receipts.length, 1);
    assertEquals(b7.receipts[0].result, '(ok true)');


    operatorBalanceAfter = getBalance(chain, operator.address);
    rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceAfter = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceAfter = getBalance(chain, supportedWallet.address);
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 100);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 47500);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 47500);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 5000);


  }
});

Clarinet.test({
  name: "Ensure that funds from deposits on payment contract are distributed",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let refcode = 'abcd';

    let owner = accounts.get('deployer')!;
    let userA = accounts.get('wallet_1')!;
    let userB = accounts.get('wallet_2')!;
    let operator = accounts.get('wallet_5')!;
    let supportedWallet = accounts.get('wallet_6')!;

    const paymentContractAddress = owner.address + '.creature-racer-payment-v3';

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, userA, refcode, operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
      Tx.contractCall('creature-racer-referral-nft-v3',
                      'increment-invitations',
                      [types.utf8(refcode),
                       types.principal(userB.address)],
                     operator.address)
    ]);

    assertEquals(b2.receipts.length, 2);
    assertEquals(b2.receipts[0].result, '(ok none)');
    assertEquals(b2.receipts[1].result, '(ok true)');

    
    let supportedWalletBalanceBefore = getBalance(chain,
                                                  supportedWallet.address);
    
    let b3 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v3',
                      'receive-funds',
                      [types.uint(1100)],
                      userB.address)
    ]);
    assertEquals(b3.receipts.length, 1);

    let supportedWalletBalance = getBalance(chain, supportedWallet.address);

    assertEquals(supportedWalletBalance - supportedWalletBalanceBefore,
                 495);
  },
});
