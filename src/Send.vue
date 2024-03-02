<script setup>
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow, WebviewWindow } from '@tauri-apps/api/window';
import { exit } from '@tauri-apps/api/process';
import { postDanmu } from './components/bilibili_api.js';
import { getRoomid } from "./components/config.js";
import { listen } from '@tauri-apps/api/event'
import Toast from "./components/Toast.vue";

/* 
为了实现透明窗口，在tauri.conf.json里面要把标题栏去掉
但是这样窗口就无法移动，与其写div实现一个标题栏再加上移动功能，不如直接加回来
这样，即使有标题栏，窗口也是透明的了 
*/
onMounted(async () => {
  await appWindow.setDecorations(true);
});

/* 关掉这个窗口（发送窗口）就退出整个程序 */
appWindow.onCloseRequested(async () => {
  await exit(0);
});

const WARNING_BG_COLOR = "#ffc107";

const toast_ref = ref(null);
const message = ref("");
const subtitleWindow = WebviewWindow.getByLabel('subtitle');
const send_danmu = ref(false);
async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  let greetMessage = await invoke("greet", { msg: message.value });

  let sendMessage = message.value.trim();
  // 如果去除空格后为空则不发送消息
  if (!sendMessage)
    return;

  await subtitleWindow.emit('show_message', { message: sendMessage });
  const roomid = await getRoomid();
  if (send_danmu.value) {
    const { code, message } = await postDanmu(sendMessage, roomid);
    if (code != 0) {
      toast_ref.value.showToast('发送弹幕失败：' + message, 'black', WARNING_BG_COLOR);
    }
  }

  message.value = "";
}

// 如果登录了，我需要刷新页面才能加载新的cookie
listen('refresh', async (event) => {
  location.reload();
});
</script>

<template>
  <Toast ref="toast_ref" />
  <div class="container">
    <form class="raw-container" @submit.prevent="greet">
      <input id="greet-input" v-model="message" placeholder="请输入你要发送的内容" />
      <button type="submit">发送</button>
    </form>
    <div class="raw-container">
      <input type="checkbox" class="checkbox-input" v-model="send_danmu" />
      <label class="checkbox-label">同时发送到直播间弹幕</label>
    </div>
  </div>
</template>

<style>
.container {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: center;
}

.raw-container {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

#greet-input {
  margin-right: 5px;
}

/* 复选框 */
.checkbox-input {
  margin-right: 5px;
  /* 设置复选框与标签之间的间距 */
  /* 定义自定义复选框的尺寸和样式 */
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* 复选框标签 */
.checkbox-label {
  font-size: 16px;
  color: whitesmoke;
}
</style>