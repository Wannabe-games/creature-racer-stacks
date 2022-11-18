const {
  pubKeyfromPrivKey,
  publicKeyToString,
} = require('@stacks/transactions');

if(process.argv.length == 3) {
  console.log(publicKeyToString(pubKeyfromPrivKey(process.argv[2])));
}
