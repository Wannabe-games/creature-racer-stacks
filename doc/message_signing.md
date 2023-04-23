# Messasge signing

Some of smart contracts can be invoked by any address. This is to
support scenario, when a user wants to withdraw funds from pool
to his wallet. For such operation to be accepted, it should have
a valid signature issued by operator.

## Construction of message signature

Every message is in fact a contract call performed by some user
(i.e. _UserA_) represented by a _principal_ (`tx-sender`) and
having a list of `uint` arguments.

Operator, by signing the message should authorize both that
_UserA_ in fact is allowed to perform this request and that
numeric parameters of the request have legal values.

Conceptually this is shown on diagram below.

```ditaa

                    arg1   arg2   arg3
                     \      |      /
                      \     |     /
                       \    |    /
                      +-----------+
                      |    join   |
                      +-----------+
                            |
                            v

                         argbuff
                            |
                            v
                          +----------+
 sender-pub-key-str -+--->|   join   |
                     |    +----------+
                     |         |
                     |         v
                     |    +----------+
                     |    |  sha256  |   operator-sec-key
                     |    +----------+           |
                     |         |                 +
                     |         v                /
                     |    +----------+         /
                     |    |   sign   |<-------+
                     |    +----------+
                     |         |
                     |         |
        Senderpubkey o         o operatorSignature
```

## Example

See `makeSignature` in
[admin.ts](../protocol/tests/utils/admin.ts).

## Different argument types

There are two ways to support signing for non-uint
arguments. First is used when there is a single ASCII string
argument. This approach leverages existing uint-based singature
verification algorithm, by packing ASCII string into uint
arguments. See `makeSignatureWithURI` in
[admin.ts](../protocol/tests/utils/admin.ts) for example how this
is done.

Other approach is used when mixed set of utf/ascii attributes
needs to be signed. This approach uses consensus buffer
serialization. See `makeSignatureStr` in
[admin.ts](../protocol/tests/utils/admin.ts) for some insights
how this happens.



