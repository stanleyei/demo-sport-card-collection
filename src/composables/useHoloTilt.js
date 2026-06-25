import { reactive, ref, onScopeDispose } from 'vue'

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
  let gyroHandler = null
  function enableGyro() {
    if (gyroHandler) return
    gyroHandler = (e) => {
      if (!enabled.value || e.gamma == null) return
      interactStart()
      const px = 0.5 + Math.max(-1, Math.min(1, e.gamma / 45)) * 0.5
      const py = 0.5 + Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 45)) * 0.5
      setVars(px, py)
    }
    window.addEventListener('deviceorientation', gyroHandler)
  }
  // 必須在使用者手勢中呼叫：iOS 13+ 需請求權限後才能接收
  function armGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {})
    }
    enableGyro()
  }

  onScopeDispose(() => {
    if (gyroHandler) window.removeEventListener('deviceorientation', gyroHandler)
  })

  return {
    enabled, idle, vars,
    onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd,
    armGyro, enableGyro,
  }
}
