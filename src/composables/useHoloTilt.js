import { reactive, ref, onScopeDispose } from 'vue'

// === 模組層級共用陀螺儀來源（單一監聽 + 共用基準） ===
// 不論畫面上有幾張卡，整個 App 只掛一個 deviceorientation 監聽；
// 每次事件只計算一次 px/py 後廣播給所有訂閱者，並共用同一組基準值，
// 讓所有卡的傾斜方向與幅度完全同步。
// GYRO_RANGE 越小越靈敏（吃滿 ±傾斜所需角度）；實機可在 18~25 間微調手感。
const GYRO_RANGE = 18
const gyroSubscribers = new Set() // 每個元素為 (px, py) => void
let gyroHandler = null
let baseBeta = null, baseGamma = null

function startGyro() {
  if (gyroHandler) return
  gyroHandler = (e) => {
    if (e.gamma == null) return
    // 以使用者第一筆讀數作為中心點，之後用相對位移映射，避免持握角度造成偏移
    if (baseGamma === null) { baseGamma = e.gamma; baseBeta = e.beta ?? 45 }
    const px = 0.5 + Math.max(-1, Math.min(1, (e.gamma - baseGamma) / GYRO_RANGE)) * 0.5
    const py = 0.5 + Math.max(-1, Math.min(1, ((e.beta ?? 45) - baseBeta) / GYRO_RANGE)) * 0.5
    gyroSubscribers.forEach((fn) => fn(px, py))
  }
  window.addEventListener('deviceorientation', gyroHandler)
}

function subscribeGyro(fn) {
  gyroSubscribers.add(fn)
  startGyro()
}

function unsubscribeGyro(fn) {
  gyroSubscribers.delete(fn)
  // 最後一張卡卸載後才真正移除監聽並重置基準
  if (gyroSubscribers.size === 0 && gyroHandler) {
    window.removeEventListener('deviceorientation', gyroHandler)
    gyroHandler = null
    baseGamma = null
    baseBeta = null
  }
}

// 共用的全息傾斜互動：滑鼠／觸控傾斜 + 陀螺儀 + 待機自動掃光
// 抽卡頁（CardReveal）與收藏詳細頁（HoloCard）共用，確保光效完全一致
export function useHoloTilt() {
  const enabled = ref(false) // 是否接受互動（抽卡：揭曉後才開；詳細頁：永遠開）
  const idle = ref(true)     // 待機自動掃光
  const vars = reactive({
    '--mx': '50%', '--my': '50%',
    '--posx': '50%', '--posy': '50%',
    '--rx': '0deg', '--ry': '0deg',
    '--o': '0',
  })

  function setVars(px, py) {
    px = Math.max(0, Math.min(1, px))
    py = Math.max(0, Math.min(1, py))
    vars['--rx'] = (0.5 - py) * 26 + 'deg'
    vars['--ry'] = (px - 0.5) * 26 + 'deg'
    vars['--mx'] = px * 100 + '%'
    vars['--my'] = py * 100 + '%'
    vars['--posx'] = px * 100 + '%'
    vars['--posy'] = py * 100 + '%'
    vars['--o'] = '1'
  }
  function resetVars() {
    vars['--o'] = '0'
    vars['--rx'] = '0deg'
    vars['--ry'] = '0deg'
  }

  function interactStart() { if (enabled.value) idle.value = false }
  function interactEnd() { if (enabled.value) { idle.value = true; resetVars() } }
  function pointerMove(clientX, clientY, el) {
    if (!enabled.value) return
    const r = el.getBoundingClientRect()
    setVars((clientX - r.left) / r.width, (clientY - r.top) / r.height)
  }

  // 綁定在卡片元素上的事件處理
  function onMouseMove(e) { interactStart(); pointerMove(e.clientX, e.clientY, e.currentTarget) }
  function onMouseLeave() { interactEnd() }
  function onTouchStart(e) { armGyro(); interactStart(); const t = e.touches[0]; pointerMove(t.clientX, t.clientY, e.currentTarget) }
  function onTouchMove(e) { const t = e.touches[0]; pointerMove(t.clientX, t.clientY, e.currentTarget) }
  function onTouchEnd() { interactEnd() }

  // === 陀螺儀 ===
  // 本實例的接收函式：尊重各自的 enabled 閘門，再套用到自己的 vars。
  function onGyro(px, py) {
    if (!enabled.value) return
    interactStart()
    setVars(px, py)
  }
  function enableGyro() { subscribeGyro(onGyro) }

  // 必須在使用者手勢中呼叫：iOS 13+ 需請求權限後才能接收
  function armGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {})
    }
    enableGyro()
  }

  onScopeDispose(() => { unsubscribeGyro(onGyro) })

  return {
    enabled, idle, vars,
    onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd,
    armGyro, enableGyro,
  }
}
