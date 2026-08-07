import type { AircraftModel, DamageRecord, DamageStats, MonthlyStats } from "@/types"

// ========== 5 种机型轮胎坐标与数据 ==========
// 坐标系: x=前后(nose-to-tail), y=上下(vertical), z=左右(wingspan, 左正右负)
// 编号规则: 面对飞机, 前起落架独立, 主起落架从右往左(按 z 降序)依次编号

export const aircraftModels: AircraftModel[] = [
  {
    id: "a320",
    name: "空客 A320",
    manufacturer: "空客",
    type: "窄体客机",
    tireCount: 6,
    tires: [
      // 前起落架 (独立编号, nose gear)
      { id: "ng",  position: [14.0, 0, 0],   status: "normal", label: "前轮" },
      // 主起落架: 面对飞机从右往左 (z 降序)
      { id: "m1", position: [4.0, 0, 3.5],  status: "normal", label: "1号" },
      { id: "m2", position: [4.0, 0, -3.5], status: "warning", label: "2号" },
      { id: "m3", position: [-2.0, 0, 3.5], status: "normal", label: "3号" },
      { id: "m4", position: [-2.0, 0, -3.5], status: "critical", label: "4号" },
      { id: "m5", position: [-6.0, 0, 0],    status: "normal", label: "5号" },
    ],
  },
  {
    id: "b737",
    name: "波音 B737",
    manufacturer: "波音",
    type: "窄体客机",
    tireCount: 6,
    tires: [
      { id: "ng",  position: [13.5, 0, 0],   status: "normal", label: "前轮" },
      { id: "m1", position: [3.5, 0, 3.2],  status: "normal", label: "1号" },
      { id: "m2", position: [3.5, 0, -3.2], status: "warning", label: "2号" },
      { id: "m3", position: [-1.5, 0, 3.2], status: "normal", label: "3号" },
      { id: "m4", position: [-1.5, 0, -3.2], status: "normal", label: "4号" },
      { id: "m5", position: [-5.5, 0, 0],    status: "normal", label: "5号" },
    ],
  },
  {
    id: "a330",
    name: "空客 A330",
    manufacturer: "空客",
    type: "宽体客机",
    tireCount: 10,
    tires: [
      { id: "ng",  position: [18.0, 0, 0],    status: "normal", label: "前轮" },
      { id: "m1", position: [6.0, 0, 5.5],   status: "normal", label: "1号" },
      { id: "m2", position: [6.0, 0, -5.5],  status: "normal", label: "2号" },
      { id: "m3", position: [2.0, 0, 5.5],   status: "warning", label: "3号" },
      { id: "m4", position: [2.0, 0, -5.5],  status: "normal", label: "4号" },
      { id: "m5", position: [-2.0, 0, 5.5],  status: "normal", label: "5号" },
      { id: "m6", position: [-2.0, 0, -5.5], status: "critical", label: "6号" },
      { id: "m7", position: [-6.0, 0, 5.5],  status: "normal", label: "7号" },
      { id: "m8", position: [-6.0, 0, -5.5], status: "normal", label: "8号" },
      { id: "m9", position: [-10.0, 0, 0],  status: "normal", label: "9号" },
    ],
  },
  {
    id: "b777",
    name: "波音 B777",
    manufacturer: "波音",
    type: "宽体客机",
    tireCount: 14,
    tires: [
      { id: "ng",  position: [22.0, 0, 0],    status: "normal", label: "前轮" },
      { id: "m1", position: [8.0, 0, 6.5],   status: "normal", label: "1号" },
      { id: "m2", position: [8.0, 0, -6.5],  status: "normal", label: "2号" },
      { id: "m3", position: [4.0, 0, 6.5],   status: "warning", label: "3号" },
      { id: "m4", position: [4.0, 0, -6.5],  status: "normal", label: "4号" },
      { id: "m5", position: [0.0, 0, 6.5],    status: "normal", label: "5号" },
      { id: "m6", position: [0.0, 0, -6.5],   status: "critical", label: "6号" },
      { id: "m7", position: [-4.0, 0, 6.5],  status: "normal", label: "7号" },
      { id: "m8", position: [-4.0, 0, -6.5], status: "normal", label: "8号" },
      { id: "m9", position: [-8.0, 0, 6.5],  status: "warning", label: "9号" },
      { id: "m10", position: [-8.0, 0, -6.5], status: "normal", label: "10号" },
      { id: "m11", position: [-12.0, 0, 6.5], status: "normal", label: "11号" },
      { id: "m12", position: [-12.0, 0, -6.5], status: "normal", label: "12号" },
      { id: "m13", position: [-16.0, 0, 0],   status: "normal", label: "13号" },
    ],
  },
  {
    id: "a380",
    name: "空客 A380",
    manufacturer: "空客",
    type: "超大型客机",
    tireCount: 22,
    tires: [
      { id: "ng",  position: [28.0, 0, 0],    status: "normal", label: "前轮" },
      { id: "m1", position: [12.0, 0, 8.0],   status: "normal", label: "1号" },
      { id: "m2", position: [12.0, 0, -8.0],  status: "normal", label: "2号" },
      { id: "m3", position: [8.0, 0, 8.0],    status: "warning", label: "3号" },
      { id: "m4", position: [8.0, 0, -8.0],   status: "normal", label: "4号" },
      { id: "m5", position: [4.0, 0, 8.0],    status: "normal", label: "5号" },
      { id: "m6", position: [4.0, 0, -8.0],   status: "critical", label: "6号" },
      { id: "m7", position: [0.0, 0, 8.0],    status: "normal", label: "7号" },
      { id: "m8", position: [0.0, 0, -8.0],   status: "normal", label: "8号" },
      { id: "m9", position: [-4.0, 0, 8.0],   status: "warning", label: "9号" },
      { id: "m10", position: [-4.0, 0, -8.0],  status: "normal", label: "10号" },
      { id: "m11", position: [-8.0, 0, 8.0],   status: "normal", label: "11号" },
      { id: "m12", position: [-8.0, 0, -8.0],  status: "normal", label: "12号" },
      { id: "m13", position: [-12.0, 0, 8.0],  status: "warning", label: "13号" },
      { id: "m14", position: [-12.0, 0, -8.0], status: "normal", label: "14号" },
      { id: "m15", position: [-16.0, 0, 8.0],  status: "normal", label: "15号" },
      { id: "m16", position: [-16.0, 0, -8.0], status: "normal", label: "16号" },
      { id: "m17", position: [-20.0, 0, 8.0],  status: "normal", label: "17号" },
      { id: "m18", position: [-20.0, 0, -8.0], status: "normal", label: "18号" },
      { id: "m19", position: [-24.0, 0, 4.0],  status: "normal", label: "19号" },
      { id: "m20", position: [-24.0, 0, -4.0], status: "normal", label: "20号" },
      { id: "m21", position: [-28.0, 0, 0],    status: "normal", label: "21号" },
    ],
  },
]

// ========== 辅助函数 ==========

export function getStatusColor(status: string): string {
  switch (status) {
    case "normal": return "#00D2FF"
    case "warning": return "#FFD60A"
    case "critical": return "#FF3B30"
    default: return "#00D2FF"
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "normal": return "正常"
    case "warning": return "警告"
    case "critical": return "严重"
    default: return "正常"
  }
}

// ========== 生成模拟损伤历史 ==========

export function generateDamageHistory(modelId: string, tireId: string): DamageRecord[] {
  const baseDate = new Date("2024-01-15")
  const records: DamageRecord[] = []
  const count = 3 + Math.floor(Math.random() * 5)

  const types = ["割伤", "磨损", "扎伤", "裂纹", "鼓包", "过热"]
  const positions = ["胎面", "胎侧", "胎肩", "胎圈"]
  const severities = ["轻微", "中等", "严重"]
  const runways = ["跑道A", "跑道B", "跑道C"]
  const departures = ["北京", "上海", "广州", "深圳", "成都"]

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i * 45 + Math.floor(Math.random() * 15))

    records.push({
      id: `${modelId}-${tireId}-${i}`,
      tireId,
      modelId,
      date: date.toISOString().split("T")[0],
      type: types[Math.floor(Math.random() * types.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      severity: severities[Math.floor(Math.random() * severities.length)] as "轻微" | "中等" | "严重",
      description: `轮胎${tireId}发现${types[Math.floor(Math.random() * types.length)]}，需定期检查。`,
      runway: runways[Math.floor(Math.random() * runways.length)],
      departure: departures[Math.floor(Math.random() * departures.length)],
      recommendation:
        Math.random() > 0.5
          ? "建议下次维护时更换"
          : "建议继续使用并加强监控",
    })
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ========== 生成月度统计 ==========

export function generateMonthlyStats(_modelId: string): MonthlyStats[] {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  return months.map((month) => ({
    month,
    damageCount: Math.floor(Math.random() * 8),
    severity: ["轻微", "中等", "严重"][Math.floor(Math.random() * 3)] as "轻微" | "中等" | "严重",
  }))
}

// ========== 生成损伤概览统计 ==========

export function generateDamageStats(modelId: string): DamageStats {
  const model = aircraftModels.find((m) => m.id === modelId)
  if (!model) {
    return { total: 0, normal: 0, warning: 0, critical: 0, byType: {} }
  }

  const stats: DamageStats = {
    total: 0,
    normal: 0,
    warning: 0,
    critical: 0,
    byType: {},
  }

  model.tires.forEach((tire) => {
    if (tire.status === "normal") stats.normal++
    else if (tire.status === "warning") stats.warning++
    else if (tire.status === "critical") stats.critical++

    const history = generateDamageHistory(modelId, tire.id)
    history.forEach((record) => {
      stats.total++
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1
    })
  })

  return stats
}
