<script setup>
import { onMounted, onScopeDispose, ref, watch } from 'vue'
import { useHoloTilt } from '../composables/useHoloTilt'
import HoloFace from './HoloFace.vue'

const props = defineProps({
  img: { type: String, required: true },
  alt: { type: String, default: '' },
  // fluid：以寬度撐滿（格狀列表用），預設以高度定尺寸（單張大卡用）
  fluid: { type: Boolean, default: false },
  // idleSweep：待機自動掃光（電腦版列表採 hover-only 時關閉）
  idleSweep: { type: Boolean, default: true },
  // zoomable：點擊卡片以全螢幕燈箱放大（翻轉一圈後放大），僅詳細頁使用
  zoomable: { type: Boolean, default: false },
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

// === 放大燈箱 ===
const zoomed = ref(false)
const inlineHidden = ref(false) // 放大時隱藏原卡，關閉落地時再現身（擺回卡槽）
const inlineCardRef = ref(null) // 頁面原卡，作為關閉時飛回的目標位置

const reduceMotion = typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

function onCardClick() {
  armGyro() // 維持陀螺儀權限請求
  if (props.zoomable) {
    inlineHidden.value = true // 先把原卡藏起來（像被拿起來放大）
    zoomed.value = true
  }
}

// 離場前量測原卡位置，把「飛回」終點（平移／縮放）以 CSS 變數帶入 keyframe。
// 透過離場 hook 的 el（離場期間 DOM 仍在）取得放大卡，避免使用會被清空的模板 ref。
// zc 本身不加任何 transform（保留透視），平移＋縮放＋旋轉全部在 .holo-zoom-flip 子層完成。
function onBeforeLeave(el) {
  const zc = el.querySelector('.holo-zoom-card')
  const flip = el.querySelector('.holo-zoom-flip')
  const target = inlineCardRef.value
  if (!zc || !target || !flip) return

  const z = zc.getBoundingClientRect()
  const t = target.getBoundingClientRect()
  flip.style.setProperty('--fly-s', (t.width / z.width).toFixed(4))
  flip.style.setProperty('--fly-x', ((t.left + t.width / 2) - (z.left + z.width / 2)).toFixed(1) + 'px')
  flip.style.setProperty('--fly-y', ((t.top + t.height / 2) - (z.top + z.height / 2)).toFixed(1) + 'px')
}

// 離場：CSS 動畫負責「轉一圈＋縮小飛回」並實心落在原卡位置；
// 動畫尾聲（放大卡已蓋住原卡）才把原卡現身，再卸載 overlay → 無縫接管（擺回去）。
function onZoomLeave(el, done) {
  const dur = reduceMotion ? 300 : 550
  window.setTimeout(() => { inlineHidden.value = false }, dur)
  window.setTimeout(done, dur + 60)
}

function onKey(e) { if (e.key === 'Escape') zoomed.value = false }

// 開啟時鎖背景捲動並監聽 ESC，關閉時還原
watch(zoomed, (v) => {
  if (v) {
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})
onScopeDispose(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    ref="inlineCardRef"
    class="holo-card holo-root is-ready"
    :class="{ 'is-idle': idle && idleSweep, 'is-fluid': fluid, 'is-zoomable': zoomable }"
    :style="[vars, { opacity: inlineHidden ? 0 : 1 }]"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @click="onCardClick"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="holo-aura"></div>
    <div class="holo-tilt">
      <HoloFace :img="img" :alt="alt" />
    </div>
  </div>

  <!-- 放大燈箱：點背景或卡片即關閉；放大層沿用同一份 vars，傾斜/陀螺儀效果一致 -->
  <Teleport to="body">
    <Transition name="zoom-fade" @before-leave="onBeforeLeave" @leave="onZoomLeave">
      <div v-if="zoomed" class="holo-zoom-overlay" @click="zoomed = false">
        <div
          class="holo-card holo-root is-ready holo-zoom-card"
          :class="{ 'is-idle': idle && idleSweep }"
          :style="vars"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div class="holo-zoom-flip">
            <div class="holo-tilt">
              <HoloFace :img="img" :alt="alt" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  perspective: 600px;
}
.holo-card.is-fluid :deep(.holo-aura) { display: none; }

/* 可放大卡片：游標提示可點擊 */
.holo-card.is-zoomable { cursor: zoom-in; }

/* === 放大燈箱 === */
.holo-zoom-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  padding: calc(env(safe-area-inset-top) + 1rem) 1rem calc(env(safe-area-inset-bottom) + 1rem);
  background: rgba(3, 6, 18, .82);
  backdrop-filter: blur(6px);
  cursor: zoom-out;
  animation: overlayIn .3s ease; /* 進場背景淡入（離場由 JS 控制） */
}
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

/* 放大後的卡片：以視窗高度撐大，置中不被裁切 */
.holo-zoom-card {
  height: min(82vh, 92vw * 1.602);
  width: auto;
  cursor: default;
}

/* 翻轉層：與傾斜層分離，翻轉一圈與放大同時進行（不露卡背） */
.holo-zoom-flip {
  position: absolute; inset: 0;
  transform-style: preserve-3d;
  transform-origin: center;
  animation: holoZoomIn .8s cubic-bezier(.2, .75, .2, 1) forwards;
}
@keyframes holoZoomIn {
  0%   { transform: scale(.32) rotateY(0deg);   opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: scale(1)   rotateY(360deg); }
}

/* 離場：只淡出背景遮罩（不淡 overlay 整體），讓放大卡保持實心、落地後蓋住原卡 */
.zoom-fade-leave-active {
  transition: background-color .55s ease, backdrop-filter .55s ease;
}
.zoom-fade-leave-to {
  background-color: rgba(3, 6, 18, 0);
  backdrop-filter: blur(0);
}

/* flip 子層：自靜止態順向再轉一圈，並平移＋縮小「實心」飛回原卡位置（終點由 CSS 變數帶入） */
.zoom-fade-leave-active .holo-zoom-flip {
  animation: holoFlyOut .55s cubic-bezier(.4, 0, .2, 1) forwards;
}
@keyframes holoFlyOut {
  from { transform: translate(0, 0) scale(1) rotateY(360deg); }
  to   { transform: translate(var(--fly-x, 0), var(--fly-y, 0)) scale(var(--fly-s, .3)) rotateY(720deg); }
}

@media (prefers-reduced-motion: reduce) {
  .holo-zoom-flip { animation: holoZoomInReduced .35s ease forwards; }
  @keyframes holoZoomInReduced {
    0%   { transform: scale(.6); opacity: 0; }
    100% { transform: scale(1);  opacity: 1; }
  }
  /* 降級：略過旋轉，仍平移縮小飛回原卡 */
  .zoom-fade-leave-active .holo-zoom-flip {
    animation: holoFlyOutReduced .3s ease forwards;
  }
  @keyframes holoFlyOutReduced {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(var(--fly-x, 0), var(--fly-y, 0)) scale(var(--fly-s, .3)); }
  }
}
</style>
