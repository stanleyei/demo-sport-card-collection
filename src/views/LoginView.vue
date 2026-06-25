<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCollection } from '../composables/useCollection'

const router = useRouter()
const { login } = useAuth()
const { add, takePending } = useCollection()

const account = ref('')
const password = ref('')

// 帳密必填（內容不做任何驗證，任意非空字串皆可）
const canSubmit = computed(() => account.value.trim() !== '' && password.value.trim() !== '')

function submit() {
  if (!canSubmit.value) return
  login(account.value.trim())
  // 若有未登入時暫存的待收藏卡，登入後自動補加入
  const pending = takePending()
  if (pending) add(pending)
  router.replace({ name: 'member' })
}
</script>

<template>
  <section class="fixed inset-0 z-[2] flex flex-col items-center justify-center px-6">
    <div class="w-full max-w-[360px] rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
         style="box-shadow: 0 24px 60px rgba(0,0,0,.5);">
      <h1 class="text-center text-2xl font-black tracking-wide">會員登入</h1>
      <p class="mt-2 text-center text-sm text-[var(--muted)]">登入後即可收藏卡片（示意：任意帳密皆可登入）</p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
        <label class="flex flex-col gap-1.5">
          <span class="text-[15px] text-[var(--muted)]">帳號 <span class="text-[var(--gold)]">*</span></span>
          <input
            v-model="account"
            type="text"
            required
            placeholder="輸入任意帳號"
            class="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[15px] text-[var(--muted)]">密碼 <span class="text-[var(--gold)]">*</span></span>
          <input
            v-model="password"
            type="password"
            required
            placeholder="輸入任意密碼"
            class="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--gold)]"
          />
        </label>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="mt-2 w-full rounded-2xl bg-[var(--gold)] px-4 py-3.5 text-lg font-bold tracking-wide text-black transition active:scale-[.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          登入並收藏
        </button>
      </form>

      <button
        class="mt-4 w-full text-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        @click="router.push({ name: 'draw' })"
      >
        ← 返回翻卡
      </button>
    </div>
  </section>
</template>
