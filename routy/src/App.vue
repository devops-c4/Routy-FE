<template>
  <div id="app">
      <Header /> 
    <router-view />

    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style>
#app {
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
}
</style>
