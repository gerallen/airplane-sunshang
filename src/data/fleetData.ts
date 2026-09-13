import type { Aircraft, FlightRecord, TireWound, TireDamage, TireData } from '@/types'
import { getModel } from './aircraftData'

// ========== 选项常量 ==========

export const runwayOptions = [
  '跑道01L', '跑道01R', '跑道19L', '跑道19R',
  '跑道36L', '跑道36R', '跑道18L', '跑道18R',
]

export const departureOptions = [
  '北京首都', '上海浦东', '广州白云', '深圳宝安',
  '成都天府', '杭州萧山', '西安咸阳', '重庆江北',
  '武汉天河', '南京禄口', '青岛胶东', '厦门高崎',
  '三亚凤凰', '拉萨贡嘎', '乌鲁木齐地窝堡',
]

const TAXIWAYS = ['A1', 'A5', 'B2', 'B3', 'B6', 'C2', 'C4', 'D1', 'E3']

const AIRLINES = ['顺丰航空', '中国国航', '东方航空', '南方航空', '海南航空']
const FLIGHT_PREFIX = ['O3', 'CA', 'MU', 'CZ', 'HU']
const OTHER_CATEGORIES = ['轮毂', '刹车组件', '起落架舱门', '机身蒙皮', '轮舱']

// ========== 确定性伪随机 ==========

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

// ========== 机队演示数据生成 ==========

const FLEET_SEED: { modelId: string; aircraftNos: string[] }[] = [
  { modelId: 'b737', aircraftNos: ['B-5512', 'B-5405', 'B-5302'] },
  { modelId: 'b747', aircraftNos: ['B-2445', 'B-2447', 'B-2472'] },
  { modelId: 'b767', aircraftNos: ['B-2559', 'B-2560', 'B-2493'] },
  { modelId: 'b777', aircraftNos: ['B-2020', 'B-2048', 'B-2099'] },
]

const DAMAGE_TYPES: TireWound['type'][] = ['cut', 'puncture', 'wear', 'bulge', 'crack']
const DAMAGE_POSITIONS: TireWound['position'][] = ['tread', 'sidewall', 'shoulder', 'bead']
const TYPE_DESC: Record<string, string> = {
  cut: '划伤', puncture: '扎伤', wear: '磨损', bulge: '鼓包', crack: '裂纹',
}
const POS_DESC: Record<string, string> = {
  tread: '胎冠', sidewall: '胎侧', shoulder: '胎肩', bead: '胎圈',
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function genWound(rand: () => number, tireIds: string[], departure: string): TireWound {
  const type = pick(rand, DAMAGE_TYPES)
  const position = pick(rand, DAMAGE_POSITIONS)
  const size = type === 'puncture'
    ? { depth: 3 + Math.floor(rand() * 10) }
    : rand() > 0.3
      ? { length: 8 + Math.floor(rand() * 40), width: 1 + Math.floor(rand() * 8) }
      : { length: 8 + Math.floor(rand() * 40), width: 1 + Math.floor(rand() * 8), depth: 1 + Math.floor(rand() * 6) }
  // 约 15% 为轮胎以外的其他部位损伤
  const isOther = rand() < 0.15
  const category = isOther ? pick(rand, OTHER_CATEGORIES) : undefined
  return {
    tireId: isOther ? '其他' : pick(rand, tireIds),
    category,
    size,
    type,
    position,
    attachment: rand() > 0.2 ? '无附着物' : '有少量金属碎屑附着',
    description: isOther
      ? `${category}${TYPE_DESC[type]}，${departure}起飞航班降落后检查发现`
      : `${POS_DESC[position]}${TYPE_DESC[type]}，${departure}起飞航班降落后检查发现`,
  }
}

function recordStatus(wounds: TireWound[]): FlightRecord['status'] {
  if (wounds.length === 0) return 'normal'
  if (wounds.length >= 5) return 'critical'
  return 'warning'
}

function genRecords(aircraftNo: string, modelId: string): FlightRecord[] {
  const rand = mulberry32(hashSeed(`fleet::${aircraftNo}`))
  const tireIds = getModel(modelId).tires.map(t => t.id)
  const now = new Date()
  const count = 3 + Math.floor(rand() * 5) // 3~7 条记录

  const records: FlightRecord[] = []
  let dayOffset = 2 + Math.floor(rand() * 10)
  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    dayOffset += 15 + Math.floor(rand() * 45)

    const departure = pick(rand, departureOptions)
    const woundCount = rand() > 0.25 ? 1 + Math.floor(rand() * 4) : 0 // 75% 有伤
    const wounds: TireWound[] = []
    for (let j = 0; j < woundCount; j++) wounds.push(genWound(rand, tireIds, departure))

    // 事件处置时间链（有伤口的记录才生成）
    const hasWounds = wounds.length > 0
    const base = date.getTime() + 8 * 3600_000
    const iso = (t: number) => new Date(t).toISOString().slice(0, 16)
    const reportTime = hasWounds ? iso(base) : undefined
    const arriveTime = reportTime ? iso(base + (10 + Math.floor(rand() * 40)) * 60_000) : undefined
    const finishTime = arriveTime ? iso(base + (60 + Math.floor(rand() * 180)) * 60_000) : undefined
    const lastInspectTime = iso(base - (12 + Math.floor(rand() * 48)) * 3600_000)
    const lastRunwayInspectTime = iso(base - (1 + Math.floor(rand() * 5)) * 3600_000)
    const lastTaxiwayInspectTime = iso(base - (2 + Math.floor(rand() * 8)) * 3600_000)
    const arrivalPool = departureOptions.filter(d => d !== departure)
    const landingTime = `${String(8 + Math.floor(rand() * 14)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`

    records.push({
      id: `${aircraftNo}-R${String(i + 1).padStart(2, '0')}`,
      date: date.toISOString().split('T')[0],
      departure,
      landingRunway: pick(rand, runwayOptions),
      taxiRoute: [pick(rand, TAXIWAYS), pick(rand, TAXIWAYS), pick(rand, TAXIWAYS)].join('→'),
      parkingStand: pick(rand, ['W', 'E', 'N']) + (101 + Math.floor(rand() * 298)),
      lastInspectTime,
      fodAlarm: hasWounds ? rand() > 0.6 : false,
      reportTime,
      arriveTime,
      finishTime,
      airline: pick(rand, AIRLINES),
      flightNo: pick(rand, FLIGHT_PREFIX) + (100 + Math.floor(rand() * 800)),
      arrival: pick(rand, arrivalPool),
      landingTime,
      lastRunwayInspectTime,
      lastTaxiwayInspectTime,
      wounds,
      status: recordStatus(wounds),
    })
  }
  return records // 已按时间倒序（最近的在前）
}

export const initialFleet: Aircraft[] = FLEET_SEED.flatMap(({ modelId, aircraftNos }) =>
  aircraftNos.map(aircraftNo => ({
    id: aircraftNo,
    aircraftNo,
    modelId,
    records: genRecords(aircraftNo, modelId),
  }))
)

// ========== 轮胎履历聚合：由飞机的检查记录推导轮胎视图 ==========

export function buildTireView(aircraft: Aircraft): TireData[] {
  const model = getModel(aircraft.modelId)
  const now = new Date()

  return model.tires.map(base => {
    // 聚合该轮胎在所有记录中的伤口（记录已按时间倒序）
    const history: TireDamage[] = []
    for (const rec of aircraft.records) {
      for (const w of rec.wounds) {
        if (w.tireId !== base.id) continue
        const dims = [w.size.length, w.size.width, w.size.depth].filter(v => v !== undefined)
        history.push({
          date: rec.date,
          type: w.type,
          position: w.position,
          category: w.category,
          size: dims.length ? dims.join('x') + 'mm' : '—',
          description: w.description,
          departure: rec.departure,
          runway: rec.landingRunway,
          aircraftNo: aircraft.aircraftNo,
        })
      }
    }

    // 月度统计（最近12个月）
    const monthlyStats = new Array(12).fill(0)
    for (const e of history) {
      const d = new Date(e.date)
      const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      if (monthDiff >= 0 && monthDiff < 12) monthlyStats[11 - monthDiff]++
    }

    // 状态推导（不再区分损伤严重等级，仅按次数与近期性）
    let status: TireData['status'] = 'normal'
    const latest = history[0]
    if (latest) {
      const days = Math.floor((now.getTime() - new Date(latest.date).getTime()) / 86400000)
      if (days <= 45 || history.length >= 5) status = 'warning'
      if (history.length >= 6 || (days <= 45 && history.length >= 3)) status = 'critical'
    }

    return {
      ...base,
      status,
      damageCount: history.length,
      lastInspect: aircraft.records[0]?.date,
      damageHistory: history,
      monthlyStats,
    }
  })
}

/** 在轮胎视图末尾追加"其他"部位损伤的聚合行（若有） */
export function buildTireViewWithOther(aircraft: Aircraft): TireData[] {
  const tires = buildTireView(aircraft)
  const now = new Date()
  const history: TireDamage[] = []
  for (const rec of aircraft.records) {
    for (const w of rec.wounds) {
      if (w.tireId !== '其他') continue
      const dims = [w.size.length, w.size.width, w.size.depth].filter(v => v !== undefined)
      history.push({
        date: rec.date,
        type: w.type,
        position: w.position,
        category: w.category,
        size: dims.length ? dims.join('x') + 'mm' : '—',
        description: w.description,
        departure: rec.departure,
        runway: rec.landingRunway,
        aircraftNo: aircraft.aircraftNo,
      })
    }
  }
  if (history.length === 0) return tires

  const monthlyStats = new Array(12).fill(0)
  for (const e of history) {
    const d = new Date(e.date)
    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (monthDiff >= 0 && monthDiff < 12) monthlyStats[11 - monthDiff]++
  }

  let status: TireData['status'] = 'normal'
  const days = Math.floor((now.getTime() - new Date(history[0].date).getTime()) / 86400000)
  if (days <= 45 || history.length >= 5) status = 'warning'
  if (history.length >= 6 || (days <= 45 && history.length >= 3)) status = 'critical'

  tires.push({
    id: '其他',
    label: '其他部位',
    position: [0, 0, 0],
    status,
    damageCount: history.length,
    lastInspect: aircraft.records[0]?.date,
    damageHistory: history,
    monthlyStats,
  })
  return tires
}

/** 飞机上一次事发（有损伤的检查记录） */
export function lastDamageEvent(aircraft: Aircraft): FlightRecord | undefined {
  return aircraft.records.find(r => r.wounds.length > 0)
}

/** 飞机整体状态 = 最严重的轮胎状态；无记录则为最近一次记录状态或 normal */
export function aircraftStatus(aircraft: Aircraft): 'normal' | 'warning' | 'critical' {
  const tires = buildTireView(aircraft)
  if (tires.some(t => t.status === 'critical')) return 'critical'
  if (tires.some(t => t.status === 'warning')) return 'warning'
  return 'normal'
}
