<template>
  <Header />
  <div class="travel-layout">
    <router-view /> <!-- 여기에 Step1~4 단계 컴포넌트가 표시됨 -->
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
</script>

<style scoped>
.travel-layout {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
  padding: 40px 10%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>
