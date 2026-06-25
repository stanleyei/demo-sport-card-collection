<script setup>
import { onMounted } from 'vue'
import { useHoloTilt } from '../composables/useHoloTilt'

defineProps({
  img: { type: String, required: true },
  alt: { type: String, default: '' },
})

const {
  enabled, idle, vars,
  onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, armGyro,
} = useHoloTilt()

// 詳細頁卡片已揭曉，永遠可互動
onMounted(() => { enabled.value = true })
</script>

<template>
  <div
    class="holo-card holo-root is-ready"
    :class="{ 'is-idle': idle }"
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
  cursor: grab;
  border-radius: var(--card-radius);
  box-shadow: 0 24px 55px rgba(0,0,0,.6);
}
.holo-card:active { cursor: grabbing; }
</style>
