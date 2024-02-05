<script setup>
import { ref } from 'vue';

const show = ref(false);
const message = ref('');
const fgColor = ref('fff');
const bgColor = ref('#333');

let hideTimer;
const showToast = (msg, fg, bg, hideTime) => {
  message.value = msg;
  fgColor.value = fg || "#fff";
  bgColor.value = bg || "#333";

  hideTime = hideTime || 3000;

  show.value = true;
  // 因为又显示了一次，所以把之前的timer给清掉
  clearInterval(hideTimer);
  hideTimer = setTimeout(() => {
    hideToast();
  }, hideTime);
};

const hideToast = () => {
  show.value = false;
};

defineExpose({ showToast });

</script>

<template>
  <Transition name="slide-fade">
    <div v-if="show" class="toast" :style="{ color: fgColor, background: bgColor }" @click="hideToast">
      {{ message }}
    </div>
  </Transition>
</template>


<style>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
}

/* 由vue3的Transition实现动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
