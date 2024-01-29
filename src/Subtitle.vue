<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Greet from "./components/Greet.vue";


import { appWindow } from '@tauri-apps/api/window';
import { onMounted } from 'vue';
import { exit } from '@tauri-apps/api/process';

/* 
为了实现透明窗口，在tauri.conf.json里面要把标题栏去掉
但是这样窗口就无法移动，与其写div实现一个标题栏再加上移动功能，不如直接加回来
这样，即使有标题栏，窗口也是透明的了 
*/
onMounted(async () => {
  await appWindow.setDecorations(true);
});

/* 关掉这个窗口（显示窗口）就退出整个程序 */
appWindow.onCloseRequested(async () => {
  await exit(0);
});

</script>

<template>
  <Greet />
</template>

<style scoped>

body {
  background-color: black;
}
</style>
