# Error codes used in the project

## Any context

## err-forbidden (err u403)
Principal is not allowed to perform operation (i.e. operation is
reserved to operator or contract owner).

### err-not-found (err u404)

A resource is not found. Usually happens when function argument
is an nft id or principal which is not known to the system yet.

### err-expired (err u419)

A resource (i.e. a creature nft) is used after its expire date.

### err-operator-unset (err u1001)

Operator principal is not set.

### err-invalid-signature (err u1002)

Backend siganture verification failed.


## Payments and withdrawal

### err-insufficient-ammount (err u2001), (err u6002)

User's wallet does not have enough funds to perform an operation
(i.e. to pay for the NFT)

### err-insufficient-funds (err u2002)
A pool does not have enough balance to perform requested
withdrawal operation.

## Referrals and NFTs
### err-unknown-transfer-error (err u2003)
Fund transfer attempt has failed.

### err-refcode-used (err u3001)
User attempts to mint a rNFT using referral code that was already
used.

### err-rnft-already-granted (err u3002)
User attempts to mint a rNFT, but he already has one.

### err-has-fixed-bonus (err u3003)
Attempt to set referral to receiving fixed bonus, but it has
already been set so.

### err-only-first-owner (err u3004)
An operation is only allowed for first / initial owner of the NFT

### err-invalid-length (err u3005)
Invalid referral code length.

### err-invalid-recipient (err u3006)
Invalid recipient of NFT transfer. I.e. attemt to transfer NFT to
self.


### err-argument-out-of-range (err u3007)
Argument is out of allowed range (i.e. attempt to set percent
share above 100%).

### err-mint-cap-exceeded (err u7001)
attempt to mint a creature which parameters exceed mint cap.

### err-expiry-time-in-past (err u7002)
attempt to mint a creature with expiry time set in past.

### err-invalid-creature-type (err u7003)

### err-value-out-of-range (err u7004)

### err-not-enough-arguments (err u7005)

### err-invalid-withdrawal-count (err u6001)

Withdrawal count mismatch during withdrawal attempt. Probably
means duplicated withdrawal request.

### err-not-owner (err u8001)

User does not own the creature.

### err-creature-locked (err u8002)
Creature is locked in staking contract.


### err-nothing-to-withdraw (err u8003)
User has no creatures at stake but wants to withdraw one.
