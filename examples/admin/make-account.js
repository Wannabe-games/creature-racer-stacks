const { 
  generateSecretKey,
  generateWallet,
  generateNewAccount
} = require('@stacks/wallet-sdk');
const {
  makeRandomPrivKey,
  createStacksPrivateKey,
  privateKeyToString,
  getAddressFromPrivateKey,
  getPublicKey,
  publicKeyToString,
  publicKeyToAddress,
  AddressVersion,
  TransactionVersion,
} = require('@stacks/transactions');


function outputAccount(account) {
  const stacksPrivateKey = createStacksPrivateKey(account.stxPrivateKey);
  const pubKey = getPublicKey(stacksPrivateKey);
  const testnetAddr = publicKeyToAddress(AddressVersion.TestnetSingleSig,
                                         pubKey);
  const mainnetAddr = publicKeyToAddress(AddressVersion.MainnetSingleSig,
                                         pubKey);
  
  console.log("private key:     ", privateKeyToString(stacksPrivateKey));
  console.log("public key:      ", publicKeyToString(pubKey));
  console.log("testnet address: ", testnetAddr);
  console.log("mainnet address: ", mainnetAddr);
}

async function makeRandomAccount() {

  var secretKey = '';
  if(process.argv.length > 2) {
    secretKey = process.argv[2];
  } else {
    console.log("(no mnemonic given on command line, generating random one)");
    secretKey = generateSecretKey();
  }
  const wallet = await generateWallet({
    secretKey, password:''
  });
  console.log("mnemonic: ", secretKey);
  outputAccount(wallet.accounts[0]);
}

makeRandomAccount().then(() => {
  console.log(".");
  }
);
