<script setup>
import { onMounted } from 'vue'
import { useHoloTilt } from '../composables/useHoloTilt'

defineProps({
  img: { type: String, required: true },
  alt: { type: String, default: '' },
  // fluid：以寬度撐滿（格狀列表用），預設以高度定尺寸（單張大卡用）
  fluid: { type: Boolean, default: false },
  // idleSweep：待機自動掃光（電腦版列表採 hover-only 時關閉）
  idleSweep: { type: Boolean, default: true },
})

const {
  enabled, idle, vars,
  onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, armGyro, enableGyro,
} = useHoloTilt()

// 詳細頁卡片已揭曉，永遠可互動；並自動掛上陀螺儀監聽，
// 讓卡片一進畫面就像翻卡頁一樣跟著手機晃動（權限已於抽卡流程授予）。
onMounted(() => {
  enabled.value = true
  enableGyro()
})
</script>

<template>
  <div
    class="holo-card holo-root is-ready"
    :class="{ 'is-idle': idle && idleSweep, 'is-fluid': fluid }"
    :style="vars"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="armGyro"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="holo-aura"></div>
    <div class="holo-tilt">
      <img class="holo-img" :src="img" :alt="alt" />
      <div class="holo-shine"></div>
      <div class="holo-glare"></div>
    </div>
  </div>
</template>

<style scoped>
.holo-card {
  height: var(--card-h);
  aspect-ratio: 618 / 990;
  width: auto;
  position: relative;
  perspective: 1200px;
  border-radius: var(--card-radius);
  box-shadow: 0 24px 55px rgba(0,0,0,.6);
}

/* 格狀列表變體：以寬度撐滿欄位，並隱藏背後光環（減少 GPU 負擔與視覺雜訊） */
.holo-card.is-fluid {
  height: auto;
  width: 100%;
  /* 小卡尺寸縮小會使傾斜深度變淺，縮短透視距離補回明顯的晃動幅度 */
  perspective: 700px;
}
.holo-card.is-fluid :deep(.holo-aura) { display: none; }
</style>
