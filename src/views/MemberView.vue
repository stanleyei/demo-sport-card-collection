<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCollection } from '../composables/useCollection'
import HoloCard from '../components/HoloCard.vue'

const router = useRouter()
const { user, logout } = useAuth()
const { items, count, clear } = useCollection()

function drawAgain() {
  router.push({ name: 'draw' })
}

function openDetail(uid) {
  router.push({ name: 'card-detail', params: { uid } })
}

function doLogout() {
  logout()
  clear()
  router.replace({ name: 'draw' })
}
</script>

<template>
  <section class="fixed inset-0 z-[2] flex flex-col">
    <!-- 頁首 -->
    <header class="flex items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sm:px-5">
      <div class="min-w-0">
        <h1 class="text-xl font-black tracking-wide sm:text-2xl">我的收藏</h1>
        <p class="truncate text-[15px] text-[var(--muted)]">
          {{ user?.account }} · 共 {{ count }} 張
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <!-- 再抽一張：回到翻卡頁 -->
        <button
          class="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--gold)]/60 bg-[var(--gold)]/15 px-4 py-2.5 text-[15px] font-bold text-[var(--gold)] transition hover:bg-[var(--gold)]/25 active:scale-95"
          title="繼續綁定"
          @click="drawAgain"
        >
          <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-3.5-7.1" /><path d="M21 3v6h-6" />
          </svg>
          繼續綁定
        </button>
        <button
          class="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[15px] text-[var(--muted)] transition hover:bg-white/10 active:scale-95"
          @click="doLogout"
        >
          登出
        </button>
      </div>
    </header>

    <!-- 收藏清單 -->
    <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-5">
      <!-- 空狀態 -->
      <div v-if="!count" class="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p class="text-lg text-[var(--muted)]">尚無收藏，去收藏一張卡吧！</p>
        <button
          class="rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-lg font-bold text-black transition active:scale-95"
          @click="drawAgain"
        >
          前往綁定
        </button>
      </div>

      <!-- 卡片格狀清單（僅留卡片，互動光效與內容頁／翻卡頁同源；電腦版 hover-only） -->
      <ul v-else class="grid grid-cols-2 gap-5 py-2 sm:grid-cols-3 md:grid-cols-4">
        <li
          v-for="item in items"
          :key="item.uid"
          class="cursor-pointer"
          @click="openDetail(item.uid)"
        >
          <HoloCard fluid :idle-sweep="false" :img="item.img" :alt="item.name" />
        </li>
      </ul>
    </div>
  </section>
</template>
