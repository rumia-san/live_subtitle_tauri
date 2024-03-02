<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Greet from "./components/Greet.vue";
import { getWindowColor } from './components/config.js';


import { appWindow } from '@tauri-apps/api/window';
import { ref, onMounted } from 'vue';
import { exit } from '@tauri-apps/api/process';
import { listen } from '@tauri-apps/api/event'

const windowColor = ref("");

/* 
为了实现透明窗口，在tauri.conf.json里面要把标题栏去掉
但是这样窗口就无法移动，与其写div实现一个标题栏再加上移动功能，不如直接加回来
这样，即使有标题栏，窗口也是透明的了 
*/
onMounted(async () => {
  await appWindow.setDecorations(true);
  const color = await getWindowColor();
  windowColor.value = color ? color : '#0000001a';
});

/* 关掉这个窗口（显示窗口）就退出整个程序 */
appWindow.onCloseRequested(async () => {
  await exit(0);
});

// 如果设置变更了，我需要刷新页面才能加载新的颜色设置
listen('refresh', async (event) => {
  location.reload();
});

</script>

<template>
  <div class="all-content" :style="{ 'background-color': windowColor }">
    <Greet />
  </div>
</template>

<style scoped>
.all-content {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  box-sizing: border-box;
}
</style>
