import { reactive, computed } from 'vue'

const AUTH_KEY = 'cardAuth'

// 從 sessionStorage 還原登入狀態（示意用，僅存帳號）
function load() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const state = reactive({
  user: load(), // { account } 或 null
})

function persist() {
  if (state.user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(state.user))
  } else {
    sessionStorage.removeItem(AUTH_KEY)
  }
}

// 登入僅為示意：任意帳密皆可通過，只記錄帳號
function login(account) {
  state.user = { account: account || '訪客' }
  persist()
}

function logout() {
  state.user = null
  persist()
}

export function useAuth() {
  return {
    user: computed(() => state.user),
    isLoggedIn: computed(() => !!state.user),
    login,
    logout,
  }
}
