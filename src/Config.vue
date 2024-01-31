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
    <div class="settings-row">
      <label for="room-number">房间号</label>
      <input id="room-number" v-model="roomid" placeholder="请输入房间号" />
    </div>
    <div class="settings-row">
      <button @click="login">登录</button>
      <button @click="logout">登出</button>
    </div>
    <div class="settings-row">
      <button @click="save">保存</button>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.settings-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 5px;
}

.settings-row button,
.settings-row input {
  width: 100%;
  margin: 0 5px;
}
.settings-row label {
  width: 25%;
  margin: 0 5px;
  display: flex;
  align-items: center;
  font-size: 1em;
  text-align: center;
}
</style>