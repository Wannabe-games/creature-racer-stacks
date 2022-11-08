Staging environment for creature smart contracts
================================================

Staging environmnent is re-started after every commit to devel
branch.

The envionment starts with all the developed contracts
deployed. It also starts with pre-defined stacks accounts
topped up, as specified in
[Devnet.toml](../protocol/settings/Devnet.toml).


Staging environment endpoints
-----------------------------

1. Stacks blockchain node REST API:
   https://testnet.wannabe.games/api
2. Stacks explorer app:
   https://testnet.wannabe.games/stacks

Requirements
------------

Staging environment should be Linux machine with same
[requirements](contract_clients.md) as for devnet and clarinet.

In addition you need tmux, git and ssh installed.

Deployment automation
---------------------

Staging machine is expected to be able to poll
creature-racer-stacks git repository.

There is a script called
[staging_deploy.sh](../ci/staging_deploy.sh), which will check if
there are any changes upstream and, if that's the case, will
fetch the changes and restart the environment. The script can be
run by hand or be executed periodically from cron.

Bootstrapping the environment
-----------------------------

1. Be sure to setup SSH key infrastructure, so that the local
   working account can poll github repository. For the automation
   to work, the private key should not be password-protected.
2. Clone the creature-racer-stacks repository and checkout the
   branch that you want the staging env to track (i.e. devel).
3. Launch `ci/staging_deploy.sh`. This will bootsrap the
   environment in a detached tmux session.
4. `ci/staging_deploy.sh` can be run periodically from cron to
   update and restart the environment in case of upstream
   changes.
   
Manually interacting with environment
-------------------------------------

To manually interact with the environment you can use `tmux ls`
to identify the staging environment session followed by `tmux
attach` to attach to this session.
