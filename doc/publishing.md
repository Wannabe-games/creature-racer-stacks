# Contract publishing guide

## Prerequisites

### Stacks account
A Stacks identity which will deploy contracts. To do that, you
may use Hiro Wallet ( https://wallet.hiro.so/ ) and create Stacks
account in it. When using Hiro wallet, ensure that you interact
with appropriate network and have account created for it (testnet
account addresses start with "ST" prefix while mainnet addresses
start with "SP" prefix).

### View your private key

Use Hiro Wallet's '...' menu to view secret key for your
account. Secret key is provided in form of 24 word mnemonic. Note
that secret key should not be made publicly available. It's up to
you to protect it against unauthorized access.

## Review deployment settings

Settings are in `protocol/settings` directory, split to separate
files depending on target network. For example, mainnet settings
are located in `protocol/settings/Mainnet.toml`. Mainnet and
testnet configuration is added to gitignore by default project
configuration, and it should stay that way.

### Update deployer account private key

in `[accounts.deployer]` section of appropriate settings file
update `mnemonic` setting to words obtained as described in _View
your private key_ section.

## Create deployment plan

Use clarinet tool to create/update deployment plan, i.e. the
following command:
```
clarinet deployments generate --low-cost --testnet
```

creates a deployment plan for testnet in
`protocol/deployments/default.testnet-plan.yaml` using
conservative approach for deployment cost estimation.


## Apply deployment plan

Once you review created deployment plan you can apply it, by
issuing command `clarinet deployment apply` with appropriate
options, i.e.: `clarinet deployment apply --testnet` applies
default deployment plan to public testnet. Prior deploying
ensure, that deployment account has enough STX on it to pay for
deployment transaction.

For public testnet you can get some STX from the faucet:
https://explorer.stacks.co/sandbox/faucet?chain=testnet


## Post-deployment configuration

Creature Racer contracts require setting operator (backend)
address. One can also consider updating default cost model.

### Setting operator address
Create operator identity (or obtain operator's Stacks
address). Note that operator's private key needs to be available
for backend code so that they can digitally sign frontend
requests.

To set operator address you need to call `set-operator` function
on `creature-racer-admin` contract. See
`examples/admin/set-operator.js` for example on how to do this
programmatically. Also you can call it interactively using Stacks
Explorer Sandbox [web
interface](https://explorer.stacks.co/sandbox/contract-call?chain=testnet). 

Note that `set-operator` function needs to be called by contract
deployer account.

### Updating cost model

Various parameters of economy model are settable. Refer to
appropriate contract sources for details and function signatures.

Callable in context of contract deployer:

- `creature-racer-nft.set-part-values`
- `creature-racer-payment.change-supported-wallet`
- `creature-racer-payment.set-portion-for-operator`

## Final notes

Once contracts are deployed, they cannot be changed. Any updates
to contracts are not possible without deploying new set of
contracts or deploying them in context of different deployer account.
