<script setup>
// 全域夜間球場氛圍背景（延續原 index.html）
</script>

<template>
  <!-- 背景層 -->
  <div class="ambiance">
    <div class="orb gold" style="width:340px;height:340px;top:-6%;left:-12%;--dx:40px;--dy:30px;animation-duration:24s"></div>
    <div class="orb blue" style="width:300px;height:300px;top:8%;right:-14%;--dx:-34px;--dy:24px;animation-duration:29s;animation-delay:-6s"></div>
    <div class="orb blue" style="width:260px;height:260px;bottom:-8%;left:-8%;--dx:30px;--dy:-28px;animation-duration:32s;animation-delay:-12s"></div>
    <div class="orb gold" style="width:220px;height:220px;bottom:2%;right:-6%;--dx:-26px;--dy:-22px;animation-duration:27s;animation-delay:-3s"></div>
  </div>
  <div class="stage-floor"></div>
  <div class="grain"></div>
  <div class="vignette"></div>

  <!-- 頁面內容 -->
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.page-enter-active,
.page-leave-active { transition: opacity 0.3s ease; }
.page-enter-from,
.page-leave-to { opacity: 0; }
</style>
