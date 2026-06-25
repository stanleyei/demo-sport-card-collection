// 卡片資料（真實身分，取自卡面；achievements 為示意資料）
// achievements 結構與運動種類無關、聚焦選手個人：{ year, title, type }
//   type: 'award' 獲獎 ／ 'participation' 參與
export const CARDS = [
  {
    id: 'CRAD01', img: '/assets/CRAD01.jpg', name: '林益全', sport: '棒球', team: '富邦悍將', position: '內野手',
    achievements: [
      { year: '2009', title: '中華職棒 年度新人王', type: 'award' },
      { year: '2011', title: '中華職棒 年度MVP', type: 'award' },
      { year: '2011', title: '中華職棒 打點王', type: 'award' },
      { year: '2013', title: '世界棒球經典賽 中華隊', type: 'participation' },
    ],
  },
  {
    id: 'CRAD02', img: '/assets/CRAD02.jpg', name: '陳傑憲', sport: '棒球', team: '統一獅', position: '內野手',
    achievements: [
      { year: '2019', title: '中華職棒 打擊王', type: 'award' },
      { year: '2021', title: '東京奧運 中華隊', type: 'participation' },
      { year: '2023', title: '世界棒球經典賽 中華隊', type: 'participation' },
      { year: '2024', title: '世界12強棒球賽 中華隊', type: 'participation' },
    ],
  },
  {
    id: 'CRAD03', img: '/assets/CRAD03.jpg', name: '王柏融', sport: '棒球', team: 'Lamigo 桃猿', position: '外野手',
    achievements: [
      { year: '2016', title: '中華職棒 打擊王', type: 'award' },
      { year: '2016', title: '中華職棒 安打王', type: 'award' },
      { year: '2017', title: '中華職棒 年度MVP', type: 'award' },
      { year: '2019', title: '日本職棒 北海道日本火腿', type: 'participation' },
    ],
  },
  {
    id: 'CRAD04', img: '/assets/CRAD04.jpg', name: '彭政閔', sport: '棒球', team: '中信兄弟', position: '內野手',
    achievements: [
      { year: '2003', title: '中華職棒 年度MVP', type: 'award' },
      { year: '2006', title: '杜哈亞運 中華隊', type: 'participation' },
      { year: '2009', title: '世界棒球經典賽 中華隊', type: 'participation' },
      { year: '2019', title: '中華職棒 引退（生涯多項打擊紀錄）', type: 'award' },
    ],
  },
]

// 運動類別圖示對照（未來新增運動只需在此擴充）
export const SPORT_ICON = {
  棒球: '⚾',
}
export function sportIcon(sport) {
  return SPORT_ICON[sport] || '🏅'
}

export function pickCard() {
  return CARDS[(Math.random() * CARDS.length) | 0]
}

export function getCardById(id) {
  return CARDS.find((c) => c.id === id) || null
}
