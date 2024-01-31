<script setup>
import { isLogin, generateLoginQRCode } from './components/bilibili_api.js';
import { getRoomid, saveConfig } from "./components/config.js";
import { ref, onMounted } from "vue";
import { QRCodeGenerator } from "./3rdparty/qr.js";

let show_qrcode = ref(false);
let isLoggedIn = ref(false);
let roomid = ref('');
let qrcode_svg = ref('');

async function showLoginStatus() {
  show_qrcode.value = false;
  isLoggedIn.value = await isLogin();
  return isLoggedIn.value;
}

onMounted(async () => {
  await showLoginStatus();
  roomid.value = await getRoomid();
});

const save = async () => {
  const configObj = { roomid: roomid.value };
  await saveConfig(configObj);
}

const login = async () => {
  if (await showLoginStatus())
    return;
  let response = await generateLoginQRCode();
  if (response) {
    var svg = QRCodeGenerator.generateSVG(response.url);
    qrcode_svg.value = svg.outerHTML;
    show_qrcode.value = true;
  }
}

const logout = async () => {
  await showLoginStatus();
}

</script>
<template>
  <div class="settings-container">
    <div class="settings-row">
      <label for="room-number">房间号</label>
      <input id="room-number" v-model="roomid" placeholder="请输入房间号" />
    </div>
    <div class="settings-row">
      <svg v-if="show_qrcode" v-html="qrcode_svg"></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">
        <rect width="150" height="150" fill="#ffffff"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="" font-size="24" fill="black">
          当前{{ isLoggedIn ? "已登录" : "未登录" }}
        </text>
      </svg>
    </div>
    <div class="settings-row">
      <button @click="login">扫码登录</button>
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