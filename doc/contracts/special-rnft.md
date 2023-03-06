# Special rNFT

Special rNFT has fixed referral profit (set to 5000bps) which is
independent from number of invitees. Special rNFT is implemented
as an attribute on normal creature-racer-referral-nft token. To
distinguish between normal and special rNFT one need to call
provided query function.

## Minting

To mint a special rNFT one calls `special-mint` function. The
arguments are:

- `refcode`: utf-8 referral code (up to 150 characters)
- `operator-sig`: 65-byte digital signature of caller arguments,
  as obtained from the operator
- `sender-pk`: 33-byte public key of the caller


The function returns `(ok uint`) on success, where `uint` is the
identifier of minted token.


## Operation

The `calculate-referral-profit` function is aware of special
property of the token and will update its calculations
accordingly.

## Querying

It is possible to query referral profit for given _refcode_ by
calling `get-refcode-profit` function. The function returns
`(result uint uint)`.

One can call `is-special-rnft` for given _token-id_ to check if
the token id is special or not. The function returns `(result
bool uint)`

rNFT _token-id_ can be obtained from _refcode_ by calling
`get-referral-token`, which returns `(result uint uint)`.
