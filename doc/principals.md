# Principals used in contract definitions

This document describes the principals used through the contract
code. Some principals are dynamically bound (**D**), which means
that they need to be set by _contract owner_ after the contract
is deployed. Others are statically (**S**) bound,
i.e. hard-coded, during contract deployment.

## Contract-owner

A principal deploying the contract. This is the only role that
can set other roles.

## Operator

Represents backend services interacting with the contract. Needs
to be set by _contract owner_.
