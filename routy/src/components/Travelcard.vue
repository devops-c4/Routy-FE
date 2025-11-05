<template>
  <div class="travel-card">
    <div class="card-header">
      <span class="city">{{ city }}</span>
      <span class="date">{{ date }}</span>
    </div>

    <h3 class="title">{{ title }}</h3>

    <div class="info">
      <span>👤 {{ user }}</span>
      <span>🕒 {{ days }}</span>
    </div>

    <div class="stats">
      <span>❤️ {{ likes }}</span>
      <span><img src="../assets/images/icons/eye.svg"></img>{{ views }}</span>
      <span>🔗 {{ shares }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  city: String,
  date: String,
  title: String,
  user: String,
  days: String,
  likes: Number,
  views: Number,
  shares: Number,
});
</script>

<style scoped>
.travel-card {
  background: linear-gradient(135deg, white 0%, rgba(239, 246, 255, 0.3) 50%, rgba(240, 253, 244, 0.3) 100%);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px;
  text-align: left;
  transition: transform 0.2s ease;
}

.travel-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.city {
  background: #eff6ff;
  border: 1px solid #bedbff;
  color: #1447e6;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.date {
  color: #6a7282;
  font-size: 12px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  margin: 16px 0;
}

.info {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #4a5565;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-flex;
}

.stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 16px;
  padding-top: 12px;
  font-size: 14px;
  color: #4a5565;
}
</style>
