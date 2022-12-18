<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Main from './components/Main.vue';
import { provideClient } from '@micro-stacks/vue';
import { StacksTestnet } from '@stacks/network';

provideClient({
  appName: 'Creature mint',
  network: new StacksTestnet({
      url: 'http://localhost:3999'
//     url: 'https://stacksapi-testnet.wannabe.games'
  }),
  appIconUrl: window.location.href + 'assets/logo.png',
});
</script>

<template>
  <img
    alt="Vue logo"
    src="./assets/vue.svg"
  />
  <Main />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
