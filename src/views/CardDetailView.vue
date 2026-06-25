<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCollection } from '../composables/useCollection'
import { getCardById, sportIcon } from '../data/cards'
import HoloCard from '../components/HoloCard.vue'

const route = useRoute()
const router = useRouter()
const { getByUid } = useCollection()

const card = computed(() => getByUid(route.params.uid))
// 戰績屬選手靜態資料，依卡號從 CARDS 查詢（不存入 sessionStorage）
const achievements = computed(() => (card.value ? getCardById(card.value.id)?.achievements ?? [] : []))

const activeTab = ref('basic') // basic | history
const slideDir = ref('next')   // next：往右頁籤 ／ prev：往左頁籤

// 切換頁籤並依方向決定滑動動畫（basic → history 為 next）
function selectTab(tab) {
  if (tab === activeTab.value) return
  slideDir.value = tab === 'history' ? 'next' : 'prev'
  activeTab.value = tab
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function goBack() {
  router.push({ name: 'member' })
}
</script>

<template>
  <section class="fixed inset-0 z-[2] flex flex-col">
    <!-- 頁首 -->
    <header class="flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sm:px-5">
      <button
        class="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[15px] font-bold text-[var(--ink)] transition hover:bg-white/10 active:scale-95"
        @click="goBack"
      >
        <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        返回收藏
      </button>
      <h1 class="text-xl font-black tracking-wide">卡片詳細</h1>
    </header>

    <!-- 內容 -->
    <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <!-- 找不到卡片 -->
      <div v-if="!card" class="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p class="text-lg text-[var(--muted)]">找不到這張收藏卡片</p>
        <button class="rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-lg font-bold text-black active:scale-95" @click="goBack">
          返回收藏
        </button>
      </div>

      <div v-else class="mx-auto flex max-w-md flex-col items-center">
        <!-- 互動光卡（與抽卡時同源：桌機滑鼠、手機陀螺儀） -->
        <HoloCard :img="card.img" :alt="card.name" />

        <!-- 姓名與類別 -->
        <h2 class="mt-4 text-3xl font-black tracking-wide">{{ card.name }}</h2>
        <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-base font-semibold text-[var(--ink)]">
          {{ sportIcon(card.sport) }} {{ card.sport }}
        </div>

        <!-- 頁籤 -->
        <div class="mt-6 grid w-full grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            class="rounded-xl py-2.5 text-[15px] font-bold transition"
            :class="activeTab === 'basic' ? 'bg-[var(--gold)] text-black' : 'text-[var(--muted)] hover:text-[var(--ink)]'"
            @click="selectTab('basic')"
          >
            基本資料
          </button>
          <button
            class="rounded-xl py-2.5 text-[15px] font-bold transition"
            :class="activeTab === 'history' ? 'bg-[var(--gold)] text-black' : 'text-[var(--muted)] hover:text-[var(--ink)]'"
            @click="selectTab('history')"
          >
            歷史戰績
          </button>
        </div>

        <!-- 頁籤內容（依方向滑動切換） -->
        <div class="mt-4 w-full overflow-hidden">
          <Transition :name="`slide-${slideDir}`" mode="out-in">
            <!-- 基本資料 -->
            <dl v-if="activeTab === 'basic'" key="basic" class="w-full divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div class="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt class="text-[15px] text-[var(--muted)]">運動類別</dt>
                <dd class="text-[17px] font-semibold">{{ sportIcon(card.sport) }} {{ card.sport }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt class="text-[15px] text-[var(--muted)]">球隊</dt>
                <dd class="text-[17px] font-semibold">{{ card.team }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt class="text-[15px] text-[var(--muted)]">守備位置</dt>
                <dd class="text-[17px] font-semibold">{{ card.position }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt class="text-[15px] text-[var(--muted)]">卡片序號</dt>
                <dd class="font-mono text-[16px] font-semibold text-[var(--gold)]">{{ card.serial }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt class="text-[15px] text-[var(--muted)]">收藏時間</dt>
                <dd class="text-[16px] font-semibold">{{ formatTime(card.collectedAt) }}</dd>
              </div>
            </dl>

            <!-- 歷史戰績 -->
            <div v-else key="history" class="w-full">
              <ul v-if="achievements.length" class="flex flex-col gap-2.5">
                <li
                  v-for="(a, i) in achievements"
                  :key="i"
                  class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5"
                >
                  <span class="w-12 shrink-0 font-mono text-[15px] font-bold text-[var(--muted)]">{{ a.year }}</span>
                  <span class="flex-1 text-[16px] font-semibold leading-snug">{{ a.title }}</span>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-bold"
                    :class="a.type === 'award'
                      ? 'bg-[var(--gold)]/20 text-[var(--gold)]'
                      : 'bg-white/10 text-[var(--muted)]'"
                  >
                    {{ a.type === 'award' ? '🏆 獲獎' : '參與' }}
                  </span>
                </li>
              </ul>
              <p v-else class="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-[var(--muted)]">
                尚無戰績資料
              </p>
              <p class="mt-3 text-center text-[12px] text-[var(--muted)]/60">＊歷史戰績為示意資料</p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 頁籤切換滑動動畫（方向感：往右頁籤由右滑入、舊內容往左滑出） */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}
.slide-next-enter-from { opacity: 0; transform: translateX(28px); }
.slide-next-leave-to   { opacity: 0; transform: translateX(-28px); }
.slide-prev-enter-from { opacity: 0; transform: translateX(-28px); }
.slide-prev-leave-to   { opacity: 0; transform: translateX(28px); }
</style>
