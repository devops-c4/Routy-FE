<template>
  <div class="chat-page">
    <h1>Routy ChatBot 🤖</h1>

    <div class="chat-box">
      <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
        <p>{{ m.text }}</p>
      </div>
    </div>

    <div class="input-area">
      <input v-model="userInput" @keyup.enter="sendMessage" placeholder="메시지를 입력하세요..." />
      <button @click="sendMessage">보내기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const userInput = ref('')
const messages = ref([
  { role: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
])

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', text: text })
  userInput.value = ''

  try {
    const res = await axios.post('http://localhost:8080/chatbot', { message: text })
    const reply = res.data.reply
    messages.value.push({ role: 'bot', text: reply })
  } catch (err) {
    console.error(err)
    messages.value.push({ role: 'bot', text: '서버 오류가 발생했어요 😢' })
  }
}
</script>

<style scoped>
.chat-page {
  max-width: 500px;
  margin: 40px auto;
  font-family: "Segoe UI", sans-serif;
  background: #f5f8fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.chat-box {
  background: white;
  border-radius: 10px;
  padding: 10px;
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.msg {
  display: inline-block; 
  padding: 8px 12px;
  border-radius: 16px;
  margin: 6px 0;
  max-width: 80%; 
  word-wrap: break-word;
  white-space: pre-wrap; 
}

.msg.user {
  background: #0078ff;
  color: white;
  align-self: flex-end;
  text-align: right;
  margin-left: auto;
}

.msg.bot {
  background: #e1e1e1;
  color: black;
  text-align: left;
  margin-right: auto;
}
.input-area {
  display: flex;
  gap: 8px;
}
input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
button {
  background: #0078ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>