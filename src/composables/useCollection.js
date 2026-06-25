import { reactive, computed } from 'vue'

const COLLECTION_KEY = 'cardCollection'
const PENDING_KEY = 'cardPending'
const SERIAL_SEQ_KEY = 'cardSerialSeq'

function loadCollection() {
  try {
    const raw = sessionStorage.getItem(COLLECTION_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadSeq() {
  const n = Number(sessionStorage.getItem(SERIAL_SEQ_KEY))
  return Number.isFinite(n) ? n : 0
}

const state = reactive({
  items: loadCollection(), // [{ uid, id, serial, img, name, team, collectedAt }]
  seq: loadSeq(),          // 全域遞增序號計數器
})

function persist() {
  sessionStorage.setItem(COLLECTION_KEY, JSON.stringify(state.items))
  sessionStorage.setItem(SERIAL_SEQ_KEY, String(state.seq))
}

// 產生唯一展示序號：卡號 + 全域遞增流水號（如 CRAD01-000007）
function nextSerial(card) {
  state.seq += 1
  return `${card.id}-${String(state.seq).padStart(6, '0')}`
}

// 加入收藏（允許重複，每張各自獨立 uid 與序號）
function add(card) {
  state.items.push({
    uid: `${card.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    serial: nextSerial(card),
    id: card.id,
    img: card.img,
    name: card.name,
    sport: card.sport,
    team: card.team,
    position: card.position,
    collectedAt: new Date().toISOString(),
  })
  persist()
}

// 以 uid 取得單張收藏（詳細頁用）
function getByUid(uid) {
  return state.items.find((c) => c.uid === uid) || null
}

// 待收藏卡片：未登入時暫存，登入後自動補加入
function setPending(card) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(card))
}

function takePending() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useCollection() {
  return {
    items: computed(() => state.items),
    count: computed(() => state.items.length),
    add,
    getByUid,
    setPending,
    takePending,
  }
}
