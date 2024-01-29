<script setup>
import { isLogin } from './components/bilibili_api.js';
import { getRoomid, saveConfig } from "./components/config.js";
import { ref, onMounted } from "vue";

let isLoggedIn = ref(false);
let roomid = ref('');

onMounted(async () => {
  isLoggedIn.value = await isLogin();
  roomid.value = await getRoomid();
});

const save = async () => {
  const configObj = { roomid: roomid.value };
  await saveConfig(configObj);
}

</script>
<template>
  <div class="settings-container">
    <div class="room-settings">
      <label for="room-number">房间号:</label>
      <input id="room-number" v-model="roomid" placeholder="请输入房间号" />
    </div>
    <div class="account-settings">
      <label>{{ isLoggedIn === null ? '加载中...' : (isLoggedIn ? '已登录' : '未登录') }}</label>
      <div class="login-logout-buttons">
        <button @click="login">登录</button>
        <button @click="logout">登出</button>
      </div>
    </div>
    <div class="save-button">
      <button @click="save">保存</button>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.room-settings,
.account-settings {
  margin-bottom: 15px;
}

.room-settings label,
.account-settings label {
  display: block;
  margin-bottom: 5px;
}

.room-settings input,
.account-settings input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.login-logout-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.login-logout-buttons button {
  flex: 1;
  margin: 0 5px;
  padding: 8px;
}

.save-button,
.save-button button {
  width: 100%;
}
</style>