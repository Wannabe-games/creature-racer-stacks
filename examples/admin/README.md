# What's here

This directory contains some helper tools for interaction with
creature racer contracts.

Most "admin" functions need to be called either by contract
deployer or by an operator.

Scripts in this directory usually assume testnet environment,
i.e.

- API endpoint: https://stacksapi-testnet.wannabe.games
- deployer address, as defined in [Devnet.toml](../../protocol/settings/Devnet.toml)

## Setting the operator

Setting the operator happens by calling `set-operator` function
of `creature-racer-admin` contract. This function needs to be
called by a contract owner (deployer). You can use
`set-operator.js`.

Example, to set wallet_1 as an operator:

```sh
node set-operator.js ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
```

## Creating and manipulating accounts

`make-account.js` script can be used to support basic automation
for Stacks accounts.

### Dumping info for existing memonic

Run `make-account.js` with 24-word mnemonic as an argument. This
will output the relevant information for the account 1 bound to
that mnemonic, i.e.:

```
$ node make-account.js "skill video economy olympic help tomato motion have book easy arrest echo eagle stand property salad mention detail juice total auto peace damp result"
mnemonic:  skill video economy olympic help tomato motion have book easy arrest echo eagle stand property salad mention detail juice total auto peace damp result
private key:      30d2637e354604193169bd4ce3c89a6de608ec3c7e5d428898135097e0147c6f01
public key:       03f9ced08e3a7a01c23dcc202814fc5afc9606bba65c87bd32ba414bb49e96f928
testnet address:  ST3FR5EE4VNFV1THDQZTB2TADZER0DEQWVTRFVCVE
mainnet address:  SP3FR5EE4VNFV1THDQZTB2TADZER0DEQWVVTASC9X
```


### Generating new stacks account

Run `make-acount.js` without mnemonic argument. This will
generate a random stacks account and output relevant data for it.

