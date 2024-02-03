<script setup>
import { isLogin, generateLoginQRCode, pollLoginQRCode, logout } from './components/bilibili_api.js';
import { getRoomid, saveConfig } from "./components/config.js";
import { saveCookie } from "./components/cookie.js";
import { ref, onMounted } from "vue";
import { QRCodeGenerator } from "./3rdparty/qr.js";
import { WebviewWindow } from '@tauri-apps/api/window'

let show_qrcode = ref(false);
let isLoggedIn = ref(false);
let roomid = ref('');
let qrcode_svg = ref('');
let loginPollTimer = null;

async function showLoginStatus() {
  show_qrcode.value = false;
  clearInterval(loginPollTimer); // 我们隐藏了二维码，所以停止轮询
  loginPollTimer = null;
  isLoggedIn.value = await isLogin();
  return isLoggedIn.value;
}

onMounted(async () => {
  await showLoginStatus();
  roomid.value = await getRoomid();
});

async function refreshSendWindow() {
  const sendWindow = WebviewWindow.getByLabel('send');
  await sendWindow.emit('refresh');
}

const save = async () => {
  const configObj = { roomid: roomid.value };
  await saveConfig(configObj);
  // 刷新发送窗口以获取新的设置
  await refreshSendWindow();
}

const perform_login = async () => {
  if (await showLoginStatus())
    return;
  let response = await generateLoginQRCode();
  if (response.code != 0)
    return;

  let svg = QRCodeGenerator.generateSVG(response.url);
  qrcode_svg.value = svg.outerHTML;
  show_qrcode.value = true;
  if (loginPollTimer) {
    // 要开始新的轮询了，清除旧的轮询
    clearInterval(loginPollTimer);
  }
  loginPollTimer = setInterval(async () => {
    let pollResult = await pollLoginQRCode(response.qrcode_key);
    console.log(pollResult);
    switch (pollResult.code) {
      case 0:
        // 扫码成功
        await saveCookie(pollResult.cookie);
        await showLoginStatus();
        // 刷新发送窗口以获取新的cookie
        await refreshSendWindow();
        break;
      case 86038:
        // 二维码己失效
        await showLoginStatus();
      default:
        break;
    }
  }, 1000);
}

const perform_logout = async () => {
  if (await showLoginStatus()) {
    await logout();
    // 在一秒后再显示一次登录状态 
    setTimeout(async () => {
      await showLoginStatus();
    }, 1000);
  }
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
        <rect width="150" height="150" fill="#ffffff" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="" font-size="24" fill="black">
          当前{{ isLoggedIn ? "已登录" : "未登录" }}
        </text>
      </svg>
    </div>
    <div class="settings-row">
      <button @click="perform_login">扫码登录</button>
      <button @click="perform_logout">登出</button>
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