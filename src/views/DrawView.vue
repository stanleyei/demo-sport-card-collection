<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CardReveal from '../components/CardReveal.vue'
import { useAuth } from '../composables/useAuth'
import { useCollection } from '../composables/useCollection'
import { sportIcon } from '../data/cards'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { add, setPending, count } = useCollection()

const revealedCard = ref(null)

function onRevealed(card) {
  revealedCard.value = card
}

// 放入收藏：已登入直接加入並進收藏清單；未登入暫存後導向登入
function collect() {
  if (!revealedCard.value) return
  if (isLoggedIn.value) {
    add(revealedCard.value)
    router.push({ name: 'member' })
  } else {
    setPending(revealedCard.value)
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <section class="fixed inset-0 z-[2] flex flex-col items-center justify-center text-center" style="gap: clamp(12px, 2.4vh, 26px); padding: 4vh 6vw calc(4vh + env(safe-area-inset-bottom));">
    <!-- 右上：我的收藏入口 -->
    <button
      class="fixed top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[15px] font-medium text-[var(--ink)] backdrop-blur transition hover:bg-white/10 active:scale-95"
      @click="router.push({ name: 'member' })"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7h18M3 12h18M3 17h18" />
      </svg>
      我的收藏
      <span v-if="count" class="ml-0.5 rounded-full bg-[var(--gold)] px-1.5 text-xs font-bold text-black">{{ count }}</span>
    </button>

    <h1 class="text-2xl font-black leading-snug tracking-wide sm:text-3xl sr-only">菁英運動員卡</h1>

    <CardReveal @revealed="onRevealed" />

    <!-- 底部資訊 / 行動區 -->
    <div class="grid w-full max-w-[420px]">
      <!-- 翻開前提示 -->
      <div v-if="!revealedCard" class="col-start-1 row-start-1">
        <div class="animate-pulse text-xl font-extrabold tracking-widest text-[var(--gold)] sm:text-[23px]">
          👆 點一下翻開
          <span class="mt-2 block text-base font-normal tracking-wide text-[var(--muted)]">翻開後可放入收藏</span>
        </div>
      </div>

      <!-- 翻開後 -->
      <div v-else class="col-start-1 row-start-1 flex flex-col gap-3">
        <div>
          <div class="text-2xl font-black tracking-wide sm:text-[28px]">{{ revealedCard.name }}</div>
          <div class="mt-0.5 text-[17px] text-[var(--muted)]">{{ revealedCard.team }} · {{ revealedCard.position }}</div>
          <div class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[15px] font-semibold text-[var(--ink)]">{{ sportIcon(revealedCard.sport) }} {{ revealedCard.sport }}</div>
        </div>
        <button
          class="w-full rounded-2xl border-2 border-[var(--gold)] bg-[var(--gold)] px-4 py-3.5 text-lg font-bold tracking-wide text-black transition active:scale-[.98] active:brightness-95"
          @click="collect"
        >
          ★ 放入收藏
        </button>
      </div>
    </div>
  </section>
</template>
