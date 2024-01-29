<script setup>
import { ref } from "vue";

const greetMsg = ref("");

let fadeTimeoutID = null;
const fadeTimeoutInMs = 5000;

async function greet(greetMessage) {
  // 检测是否只包含空格
  if (!greetMessage.trim())
    return;
  greetMsg.value = greetMessage;

  // 显示边框
  let container = document.getElementById('greet-message-container');
  container.classList.add('show');
  // 用timeout实现定时消失，先清掉防止多次触发timeout
  if (fadeTimeoutID) {
    clearTimeout(fadeTimeoutID);
  }
  fadeTimeoutID = setTimeout(function () {
    container.classList.remove('show');
  }, fadeTimeoutInMs);

  // 重播打字机动画
  let typewriter = document.getElementById('animated-typewriter');
  typewriter.style.animation = 'none';
  typewriter.focus();
  typewriter.style.animation = '';
}

import { listen } from '@tauri-apps/api/event'
// 发送窗口会发送show_message事件，payload就是要发送的字符串
listen('show_message', async (event) => {
  await greet(event.payload.message);
});
</script>

<template>
  <div class="container">
    <div id="greet-message-container" class="message-container">
      <div id="animated-typewriter" class="typewriter">
        <p class="text">{{ greetMsg }}</p>
      </div>
    </div>
  </div>
</template>

<style>

.container {
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: center;
  height: 90%;
  width: 100%;
}

.input-container {
  display: flex;
  justify-content: center;
}

.text {
  font-family: 'Microsoft Yahei', 'Source Han Serif SC', sans-serif; /* 无衬线字体 */
  color: white; /* 字体颜色为白色 */
  font-size: 36px;
  font-weight: bold;
  line-height: 1.5;
  -webkit-text-stroke: 1px black;
}

.message-container {
  flex-grow: 1;
  /* 背景色：半透明的白色 */
  background-color: rgba(255, 255, 255, 0.3);
  /* rgba(红, 绿, 蓝, 透明度) */
  /* 边框：白色 */
  border: 10px solid rgb(255, 255, 255);
  /* 设置边框为1像素宽，实线，白色 */
  /* 其他可选样式，如文字颜色、内边距等 */
  color: #000000;
  /* 文字颜色为黑色 */
  padding: 10px;
  /* 内部填充为10像素 */
  border-radius: 5px;
  /* 圆角效果 */

  /* 透明度动画 */
  opacity: 0;
  transition: opacity 0.5s ease-in-out;

  /* 子元素垂直居中 */
  display: flex;
  align-items: center;
}

.message-container.show {
  opacity: 1;
}

.typewriter {
  overflow: hidden;
  /* Ensures the content is not revealed until the animation */
  white-space: nowrap;
  /* Keeps the content on a single line */
  margin: 0 auto;
  /* Gives that scrolling effect as the typing happens */
  letter-spacing: .15em;
  /* Adjust as needed */
  animation:
    typing 3.5s steps(60, end),
    blink-caret .75s step-end infinite;
}

/* The typing effect */
@keyframes typing {
  from {
    width: 0
  }

  to {
    width: 100%
  }
}</style>