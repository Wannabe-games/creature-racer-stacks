
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

import { setOperator } from './utils/admin.ts';
import { mintRNFT, incrementInvitations,
         randomInvites } from './utils/rnft.ts';
import { getBalance, userA, userB, userC } from './utils/chain.ts';

Clarinet.test({
  name: "Ensure that funds are sent to operator of reward pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let owner = accounts.get('deployer')!;
    let userA = accounts.get('wallet_1')!;
    let operator = accounts.get('wallet_5')!;
    let supportedWallet = accounts.get('wallet_6')!;

    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v5';

    setOperator(chain, owner, operator);

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
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
      Tx.contractCall('creature-racer-payment-v5',
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

    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v5';

    setOperator(chain, owner, operator);

    let b1 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
                      'set-portion-for-operator',
                      [types.uint(2)],
                     owner.address),
      Tx.contractCall('creature-racer-payment-v5',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
    ]);

    assertEquals(b1.receipts.length, 2);
    assertEquals(b1.receipts[0].result, '(ok u10)');
    assertEquals(b1.receipts[1].result, '(ok none)');

    const operatorBalanceBefore = getBalance(chain, operator.address);
    const rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    const supportedBalanceBefore = getBalance(chain, supportedWallet.address);

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
                      'receive-funds',
                      [types.uint(100)],
                     userA.address)
     ]);
    assertEquals(b2.receipts.length, 1);
    assertEquals(b2.receipts[0].result, '(ok true)');

    const operatorBalanceAfter = getBalance(chain, operator.address);
    const rewardPoolBalanceAfter = getBalance(chain, rewardPoolAddress);
    const supportedBalanceAfter = getBalance(chain, supportedWallet.address);
    
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 2);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore,
                 49);
    assertEquals(supportedBalanceAfter - supportedBalanceBefore,
                 49);
  }
});

Clarinet.test({
  name: "Ensure that it sends fund to the referral pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let refcode = 'abcd';

    let owner = accounts.get('deployer')!;
    let uA = userA(accounts);
    let uB = userB(accounts);
    let operator = userC(accounts);
    let supportedWallet = accounts.get('wallet_6')!;

    const paymentContractAddress = owner.address + '.creature-racer-payment-v5';
    const rewardPoolAddress = owner.address + '.creature-racer-reward-pool-v5';
    const referralPoolAddress = owner.address + '.creature-racer-referral-pool-v5';

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, uA, refcode, operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');


    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
      Tx.contractCall('creature-racer-referral-nft-v5',
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
      Tx.contractCall('creature-racer-payment-v5',
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

    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 10010);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 44595);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 900);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 44595);

    randomInvites(chain, 24, refcode, operator);

    operatorBalanceBefore = getBalance(chain, operator.address);
    rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
  
    let b4 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
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
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 10010);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 42793);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 42793);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 4504);

    let b5 = chain.mineBlock([
      Tx.contractCall('creature-racer-referral-nft-v5',
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
      Tx.contractCall('creature-racer-payment-v5',
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
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 10010);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 42668);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 42668);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 4754);


    operatorBalanceBefore = getBalance(chain, operator.address);
    rewardPoolBalanceBefore = getBalance(chain, rewardPoolAddress);
    referralPoolBalanceBefore = getBalance(chain, referralPoolAddress);
    supportedWalletBalanceBefore = getBalance(chain, supportedWallet.address);
  
  
    let b7 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
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
  
    assertEquals(operatorBalanceAfter - operatorBalanceBefore, 10010);
    assertEquals(rewardPoolBalanceAfter - rewardPoolBalanceBefore, 42793);
    assertEquals(supportedWalletBalanceAfter - supportedWalletBalanceBefore, 42793);
    assertEquals(referralPoolBalanceAfter - referralPoolBalanceBefore, 4504);


  }
});

Clarinet.test({
  name: "Ensure that funds from deposits on payment contract are distributed",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    let refcode = 'abcd';

    let owner = accounts.get('deployer')!;
    let user1 = userA(accounts);
    let user2 = userB(accounts);
    let operator = userC(accounts);
    let supportedWallet = accounts.get('wallet_6')!;

    const paymentContractAddress = owner.address + '.creature-racer-payment-v5';

    setOperator(chain, owner, operator);
    let b1 = mintRNFT(chain, user1, refcode, operator);
    assertEquals(b1.receipts.length, 1);
    assertEquals(b1.receipts[0].result, '(ok u1)');

    let b2 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
                      'change-supported-wallet',
                      [types.some(types.principal(supportedWallet.address)),
                      types.uint(50)],
                      owner.address),
      Tx.contractCall('creature-racer-referral-nft-v5',
                      'increment-invitations',
                      [types.utf8(refcode),
                       types.principal(user2.address)],
                     operator.address)
    ]);

    assertEquals(b2.receipts.length, 2);
    assertEquals(b2.receipts[0].result, '(ok none)');
    assertEquals(b2.receipts[1].result, '(ok true)');

    
    let supportedWalletBalanceBefore = getBalance(chain,
                                                  supportedWallet.address);
    
    let b3 = chain.mineBlock([
      Tx.contractCall('creature-racer-payment-v5',
                      'receive-funds',
                      [types.uint(1100)],
                      user2.address)
    ]);
    assertEquals(b3.receipts.length, 1);

    let supportedWalletBalance = getBalance(chain, supportedWallet.address);

    assertEquals(supportedWalletBalance - supportedWalletBalanceBefore,
                 490);
  },
});
