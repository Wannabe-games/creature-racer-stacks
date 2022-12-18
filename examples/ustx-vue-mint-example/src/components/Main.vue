<script setup lang="ts">
 import WalletConnectButton from './WalletConnectButton.vue';
 import CreatureMint from './CreatureMint.vue';
</script>

<template>
    <WalletConnectButton />
    <CreatureMint />
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
