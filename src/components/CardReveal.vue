<script setup>
import { ref, onMounted } from 'vue'
import { pickCard, CARDS } from '../data/cards'
import { useHoloTilt } from '../composables/useHoloTilt'
import HoloFace from './HoloFace.vue'

const emit = defineEmits(['revealed'])

const backImg = `${import.meta.env.BASE_URL}assets/card-back.jpg`

// 預先載入所有卡面（含卡背），確保翻牌瞬間圖片已就緒，
// 慢網路下不會出現翻開後才從上往下載入的情況。
onMounted(() => {
  [backImg, ...CARDS.map((c) => c.img)].forEach((src) => {
    const img = new Image()
    img.src = src
  })
})

const phase = ref('pack') // pack → revealing → card
const drawn = ref(null)
const flipDeg = ref(0)
const flashGo = ref(false)
const revealed = ref(false)

// 共用全息傾斜互動（與詳細頁 HoloCard 同源）
const {
  enabled, idle, vars,
  onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, armGyro, enableGyro,
} = useHoloTilt()

// === 翻開卡片 ===
function open() {
  if (phase.value !== 'pack') return
  phase.value = 'revealing'

  drawn.value = pickCard()
  armGyro() // iOS 需在使用者手勢（點擊）內請求陀螺儀權限

  flashGo.value = true
  burst()
  setTimeout(() => (flashGo.value = false), 700)

  // 多轉一圈（+540°）再落到正面
  flipDeg.value += 540
  requestAnimationFrame(() => {
    revealed.value = true
  })
}

function onFlipEnd(e) {
  if (e.propertyName !== 'transform') return
  if (phase.value === 'revealing') {
    phase.value = 'card'
    enabled.value = true // 揭曉後開放傾斜互動
    enableGyro()
    emit('revealed', drawn.value)
  }
}

// === 粒子爆發（爆發半徑依視窗較短邊縮放，小螢幕也完整可見） ===
function burst() {
  const palette = ['#cdd9f2', '#ffffff', '#9fb2d4']
  const n = 28
  const cx = innerWidth / 2
  const cy = innerHeight / 2
  const reach = Math.min(innerWidth, innerHeight)

  for (let i = 0; i < n; i++) {
    const p = document.createElement('div')
    const c = palette[(Math.random() * palette.length) | 0]
    const size = 5 + Math.random() * 9
    Object.assign(p.style, {
      position: 'fixed', left: cx + 'px', top: cy + 'px',
      width: size + 'px', height: size + 'px', borderRadius: '50%',
      background: c, boxShadow: `0 0 8px ${c}`, zIndex: 50, pointerEvents: 'none',
    })
    document.body.appendChild(p)
    const ang = Math.random() * Math.PI * 2
    const dist = reach * (0.16 + Math.random() * 0.42)
    p.animate(
      [{ transform: 'translate(0,0) scale(1)', opacity: 1 },
       { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.2)`, opacity: 0 }],
      { duration: 700 + Math.random() * 700, easing: 'cubic-bezier(.15,.7,.3,1)' },
    ).onfinish = () => p.remove()
  }
}
</script>

<template>
  <div
    class="card holo-root"
    :class="{ revealed, 'is-ready': phase === 'card', 'is-idle': idle }"
    :style="vars"
    @click="open"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="holo-aura"></div>
    <div class="holo-tilt">
      <div class="card__flip" :style="{ transform: `rotateY(${flipDeg}deg)` }" @transitionend="onFlipEnd">
        <div class="card__face card__back">
          <img :src="backImg" alt="卡包" />
        </div>
        <div class="card__face card__front">
          <HoloFace :img="drawn?.img" alt="運動員卡" />
        </div>
      </div>
    </div>
    <div class="flash" :class="{ go: flashGo }"></div>
  </div>
</template>

<style scoped>
.card {
  height: var(--card-h); aspect-ratio: 618 / 990; width: auto;
  position: relative; perspective: 1200px; flex: 0 0 auto;
}
.card:not(.revealed) { cursor: pointer; }

.card__flip {
  position: absolute; inset: 0; transform-style: preserve-3d;
  transition: transform 1.05s cubic-bezier(.2,.75,.2,1);
}

.card__face {
  position: absolute; inset: 0; border-radius: var(--card-radius);
  overflow: hidden; backface-visibility: hidden;
  box-shadow: 0 24px 55px rgba(0,0,0,.65);
}
.card__back { transform: rotateY(0deg); background: #fff; }
.card__back img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card__back::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%);
  background-size: 250% 100%; background-position: 120% 0;
  animation: shine-sweep 3.2s ease-in-out infinite; mix-blend-mode: screen;
}
.card.revealed .card__back::after { animation: none; }
@keyframes shine-sweep { 0%{background-position:120% 0;} 60%,100%{background-position:-60% 0;} }

.card__front { transform: rotateY(180deg); background: #0a1024; }

.flash {
  position: fixed; top: 50%; left: 50%; width: 12px; height: 12px;
  transform: translate(-50%,-50%); border-radius: 50%; z-index: 40;
  background: #fff; box-shadow: 0 0 60px 30px rgba(255,255,255,.9); opacity: 0; pointer-events: none;
}
.flash.go { animation: flash .7s ease-out forwards; }
@keyframes flash {
  0%{opacity:0; transform:translate(-50%,-50%) scale(.2);}
  25%{opacity:.9;}
  100%{opacity:0; transform:translate(-50%,-50%) scale(26);}
}
</style>
