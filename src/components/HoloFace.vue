<script setup>
// 全息卡面：圖像 + 全息漸層 + 玻璃光澤（純呈現，樣式來自全域 holo.css）。
// 供原卡、放大層（HoloCard）與翻卡正面（CardReveal）共用，確保光效完全一致。
defineProps({
  img: { type: String, default: '' },
  alt: { type: String, default: '' },
})
</script>

<template>
  <img class="holo-img" :src="img" :alt="alt" />
  <div class="holo-shine"></div>
  <div class="holo-glare"></div>
</template>
