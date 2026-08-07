import type { AircraftModel, TireData, TireDamage, DamageStats, MonthlyStats } from "@/types"

// ========== 波音系列机型数据 ==========
// 编号规则: 前轮独立编号（左前、右前），主起落架依次编号 1号、2号……
// 表格展示顺序 = tires 数组顺序

// ---------- 确定性伪随机（避免每次渲染数据变化） ----------
function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- 常量选项 ----------
const DEPARTURES = [
  '北京首都', '上海浦东', '广州白云', '深圳宝安', '成都天府',
  '杭州萧山', '西安咸阳', '重庆江北', '武汉天河', '南京禄口',
  '青岛胶东', '厦门高崎', '三亚凤凰', '拉萨贡嘎', '乌鲁木齐地窝堡',
]
const RUNWAYS = [
  '跑道01L', '跑道01R', '跑道19L', '跑道19R',
  '跑道36L', '跑道36R', '跑道18L', '跑道18R',
]
const AIRCRAFT_NOS: Record<string, string[]> = {
  b737: ['B-5512', 'B-5405', 'B-5302', 'B-5689'],
  b747: ['B-2445', 'B-2447', 'B-2472'],
  b767: ['B-2559', 'B-2560', 'B-2493'],
  b777: ['B-2020', 'B-2048', 'B-2099', 'B-2031'],
}
const DAMAGE_TYPES: TireDamage['type'][] = ['cut', 'puncture', 'wear', 'bulge', 'crack']
const DAMAGE_POSITIONS: TireDamage['position'][] = ['tread', 'sidewall', 'shoulder', 'bead']
const TYPE_DESC: Record<string, string> = {
  cut: '划伤', puncture: '扎伤', wear: '磨损', bulge: '鼓包', crack: '裂纹',
}
const POS_DESC: Record<string, string> = {
  tread: '胎冠', sidewall: '胎侧', shoulder: '胎肩', bead: '胎圈',
}

// ---------- 生成单个轮胎的历史损伤 ----------
function generateTireHistory(modelId: string, rand: () => number): TireDamage[] {
  const now = new Date()
  const count = Math.floor(rand() * 7) // 0~6 次
  const events: TireDamage[] = []

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 360) + 3 // 3~363 天前
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    const type = DAMAGE_TYPES[Math.floor(rand() * DAMAGE_TYPES.length)]
    const position = DAMAGE_POSITIONS[Math.floor(rand() * DAMAGE_POSITIONS.length)]
    const severityRoll = rand()
    const severity: TireDamage['severity'] = severityRoll > 0.75 ? 'high' : severityRoll > 0.4 ? 'medium' : 'low'

    const departures = DEPARTURES
    const nos = AIRCRAFT_NOS[modelId] ?? ['B-0000']
    const departure = departures[Math.floor(rand() * departures.length)]
    const runway = RUNWAYS[Math.floor(rand() * RUNWAYS.length)]
    const aircraftNo = nos[Math.floor(rand() * nos.length)]

    const size = type === 'puncture'
      ? `${3 + Math.floor(rand() * 10)}mm深`
      : `${8 + Math.floor(rand() * 40)}x${1 + Math.floor(rand() * 8)}mm`

    events.push({
      date: date.toISOString().split('T')[0],
      type,
      position,
      severity,
      size,
      description: `${POS_DESC[position]}${TYPE_DESC[type]}，${departure}起飞航班降落后检查发现`,
      departure,
      runway,
      aircraftNo,
    })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

// ---------- 由历史推导轮胎状态与月度统计 ----------
function buildTire(modelId: string, id: string, label: string): TireData {
  const rand = mulberry32(hashSeed(`${modelId}::${id}`))
  const history = generateTireHistory(modelId, rand)
  const now = new Date()

  // 月度统计（最近12个月）
  const monthlyStats = new Array(12).fill(0)
  for (const e of history) {
    const d = new Date(e.date)
    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (monthDiff >= 0 && monthDiff < 12) monthlyStats[11 - monthDiff]++
  }

  // 状态推导
  let status: TireData['status'] = 'normal'
  const latest = history[0]
  if (latest) {
    const daysSince = Math.floor((now.getTime() - new Date(latest.date).getTime()) / 86400000)
    if (latest.severity === 'high' && daysSince <= 45) status = 'critical'
    else if (daysSince <= 45 || history.length >= 5) status = 'warning'
  }
  if (history.length >= 6) status = 'critical'

  return {
    id,
    label,
    position: [0, 0, 0], // 图表化展示不再需要 3D 坐标
    status,
    damageCount: history.length,
    lastInspect: now.toISOString().split('T')[0],
    damageHistory: history,
    monthlyStats,
  }
}

function buildTires(modelId: string, mainCount: number, mainLabel: (n: number) => string): TireData[] {
  const tires: TireData[] = [
    buildTire(modelId, '左前', '前起落架-左'),
    buildTire(modelId, '右前', '前起落架-右'),
  ]
  for (let i = 1; i <= mainCount; i++) {
    tires.push(buildTire(modelId, `${i}号`, mainLabel(i)))
  }
  return tires
}

// 主轮位置描述：奇数左侧、偶数右侧，由内向外
function sideLabel(n: number, perSide: number): string {
  const side = n % 2 === 1 ? '左' : '右'
  const idx = Math.ceil(n / 2)
  return `主起落架-${side}${idx}/${perSide}`
}

// ========== 4 种波音机型 ==========
// B737: 2 前轮 + 4 主轮（每侧 2）
// B767: 2 前轮 + 8 主轮（每侧 4）
// B777: 2 前轮 + 12 主轮（每侧 6）
// B747: 2 前轮 + 16 主轮（翼下 8 + 机身下 8）

export const aircraftModels: AircraftModel[] = [
  {
    id: 'b737',
    name: 'B737',
    manufacturer: '波音',
    type: '窄体客机',
    tireCount: 6,
    tires: buildTires('b737', 4, (n) => sideLabel(n, 2)),
  },
  {
    id: 'b747',
    name: 'B747',
    manufacturer: '波音',
    type: '宽体客机',
    tireCount: 18,
    tires: buildTires('b747', 16, (n) => {
      if (n <= 8) return `翼下起落架-${n % 2 === 1 ? '左' : '右'}${Math.ceil(n / 2)}/4`
      return `机身起落架-${n % 2 === 1 ? '左' : '右'}${Math.ceil((n - 8) / 2)}/4`
    }),
  },
  {
    id: 'b767',
    name: 'B767',
    manufacturer: '波音',
    type: '宽体客机',
    tireCount: 10,
    tires: buildTires('b767', 8, (n) => sideLabel(n, 4)),
  },
  {
    id: 'b777',
    name: 'B777',
    manufacturer: '波音',
    type: '宽体客机',
    tireCount: 14,
    tires: buildTires('b777', 12, (n) => sideLabel(n, 6)),
  },
]

// ========== 辅助函数 ==========

export function getStatusColor(status: string): string {
  switch (status) {
    case 'normal': return '#00D2FF'
    case 'warning': return '#FFD60A'
    case 'critical': return '#FF3B30'
    default: return '#00D2FF'
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'normal': return '正常'
    case 'warning': return '预警'
    case 'critical': return '严重'
    default: return '正常'
  }
}

/** 距今多少天 */
export function daysSince(dateStr: string): number {
  const now = new Date()
  const d = new Date(dateStr)
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000))
}

// ========== 损伤概览统计 ==========

export function generateDamageStats(modelId: string): DamageStats {
  const model = aircraftModels.find((m) => m.id === modelId)
  if (!model) {
    return { total: 0, normal: 0, warning: 0, critical: 0, byType: {} }
  }

  const stats: DamageStats = { total: 0, normal: 0, warning: 0, critical: 0, byType: {} }

  model.tires.forEach((tire) => {
    if (tire.status === 'normal') stats.normal++
    else if (tire.status === 'warning') stats.warning++
    else if (tire.status === 'critical') stats.critical++

    ;(tire.damageHistory ?? []).forEach((record) => {
      stats.total++
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1
    })
  })

  return stats
}

// ========== 兼容旧接口（月度统计） ==========

export function generateMonthlyStats(modelId: string): MonthlyStats[] {
  const model = aircraftModels.find((m) => m.id === modelId)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const totals = new Array(12).fill(0)
  model?.tires.forEach((t) => {
    ;(t.monthlyStats ?? []).forEach((c, i) => { totals[i] += c })
  })
  return months.map((month, i) => ({
    month,
    damageCount: totals[i],
    severity: (totals[i] > 4 ? '严重' : totals[i] > 1 ? '中等' : '轻微') as '轻微' | '中等' | '严重',
  }))
}
