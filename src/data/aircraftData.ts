import type { AircraftModel, TireData } from "@/types"

// ========== 波音系列机型静态定义 ==========
// 编号规则: 前轮独立编号（左前、右前），主起落架依次编号 1号、2号……
// 表格展示顺序 = tires 数组顺序
// 轮胎的损伤历史不再内置，由该飞机的检查记录聚合得到（见 fleetData.ts）

function staticTire(id: string, label: string): TireData {
  return { id, label, position: [0, 0, 0], status: 'normal' }
}

function buildTires(mainCount: number, mainLabel: (n: number) => string): TireData[] {
  const tires: TireData[] = [
    staticTire('左前', '前起落架-左'),
    staticTire('右前', '前起落架-右'),
  ]
  for (let i = 1; i <= mainCount; i++) {
    tires.push(staticTire(`${i}号`, mainLabel(i)))
  }
  return tires
}

// 主轮位置描述：奇数左侧、偶数右侧，由内向外
function sideLabel(n: number, perSide: number): string {
  const side = n % 2 === 1 ? '左' : '右'
  const idx = Math.ceil(n / 2)
  return `主起落架-${side}${idx}/${perSide}`
}

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
    tires: buildTires(4, (n) => sideLabel(n, 2)),
  },
  {
    id: 'b747',
    name: 'B747',
    manufacturer: '波音',
    type: '宽体客机',
    tireCount: 18,
    tires: buildTires(16, (n) => {
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
    tires: buildTires(8, (n) => sideLabel(n, 4)),
  },
  {
    id: 'b777',
    name: 'B777',
    manufacturer: '波音',
    type: '宽体客机',
    tireCount: 14,
    tires: buildTires(12, (n) => sideLabel(n, 6)),
  },
]

export function getModel(modelId: string): AircraftModel {
  return aircraftModels.find(m => m.id === modelId) || aircraftModels[0]
}

export function getModelName(modelId: string): string {
  const m = getModel(modelId)
  return `${m.manufacturer} ${m.name}`
}

// ========== 状态辅助函数 ==========

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
