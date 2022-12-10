const { fetch } = require("cross-fetch");
const {
  AccontsApi,
  InfoApi,
  TransactionsApi,
  Configuration,
  connectWebSocketClient,
} = require("@stacks/blockchain-api-client");
const prompt = require('prompt-sync')();
const cfg = new Configuration({
  fetchApi: fetch,
  //basePath: "http://127.0.0.1:3999",
  basePath: "https://stacksapi-testnet.wannabe.games",
  
});

// Note that the corresponding Stacks address needs to be set 
// as backend (operator)  (see examples/admin/set-operator.js)
const backendKey = '7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801';

async function scanBlocks(startingHeight) {
  const infoApi = new InfoApi(cfg);
  const transactionsApi = new TransactionsApi(cfg);

  const state = await infoApi.getCoreApiInfo();
  const currentHeight = state.burn_block_height;
  for(var h = startingHeight; h <= currentHeight; h++) {
    console.log("scanning height ", h);
    const txs = await transactionsApi.getTransactionsByBlockHeight({height: h});
    for(var i = 0; i < txs.total; i++) {
      console.log(txs.results[i]);
    }
  }
}


async function main() {
  await scanBlocks(1);

  //const client = await connectWebSocketClient('ws://127.0.0.1:3999');
  const client = await connectWebSocketClient('wss://stacksapi-testnet.wannabe.games');
  
  const sub = await client.subscribeAddressTransactions('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.creature-racer-referral-nft', event => {
    console.log(event);
  });
}

main().then(() => {
  
}).catch((e) => {
  console.log(e.message);
});
