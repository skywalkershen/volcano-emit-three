<template>
  <canvas id="app" ref="appRef"></canvas>
</template>
<script setup>
  import {ref} from 'vue'
  import {init} from './composables'
  const appRef = ref(null);
  init(appRef)
</script>

<style>
#app {
  background-color: black;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
