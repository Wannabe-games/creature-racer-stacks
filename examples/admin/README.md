# What's here

This directory contains some helper tools for interaction with
creature racer contracts.

Most "admin" functions need to be called either by contract
deployer or by an operator.

Scripts in this directory usually assume testnet environment,
i.e.

- API endpoint: https://stacksapi-testnet.wannabe.games
- deployer address, as defined in [Devnet.toml](../../protocol/settings/Devnet.tom;)

## Setting the operator

Setting the operator happens by calling `set-operator` function
of `creature-racer-admin` contract. This function needs to be
called by a contract owner (deployer). You can use
`set-operator.js`. `set-operator` call requires passing both
operator's stacks address and the corresponding public key.

Example, to set wallet_1 as an operator:

```sh
PUB_KEY=`node pubkey-from-seckey.js 7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801`
node set-operator.js ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 $PUB_KEY
```
