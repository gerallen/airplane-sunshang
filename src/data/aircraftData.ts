import type { AircraftModel } from '@/types/aircraft';

const generateDamageHistory = (baseCount: number) => {
  const types: Array<'cut' | 'puncture' | 'wear' | 'bulge' | 'crack'> = ['cut', 'puncture', 'wear', 'bulge', 'crack'];
  const positions: Array<'tread' | 'sidewall' | 'shoulder' | 'bead'> = ['tread', 'sidewall', 'shoulder', 'bead'];
  const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const descriptions: Array<{ text: string; size: string }> = [
    { text: '胎面纵向划伤', size: '25x3mm' },
    { text: '胎肩区域磨损超标', size: '40x8mm' },
    { text: '胎侧扎伤', size: '5mm深' },
    { text: '胎圈区域裂纹', size: '12x2mm' },
    { text: '胎面不均匀磨损', size: '深度3mm' },
    { text: '异物扎入胎体', size: '8mm深' },
    { text: '胎侧鼓包变形', size: '15x10mm' },
    { text: '胎冠横向割伤', size: '18x4mm' },
    { text: '胎肩剥离', size: '30x5mm' },
    { text: '胎面龟裂', size: '20x3mm' },
  ];
  const history = [];
  const count = baseCount + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
    history.push({
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      date: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      description: desc.text,
      size: desc.size,
    });
  }
  return history;
};

const generateMonthlyStats = (damageCount: number) => {
  const stats = [];
  let remaining = damageCount;
  for (let i = 0; i < 12; i++) {
    const maxForMonth = Math.min(remaining, Math.floor(Math.random() * 3));
    stats.push(maxForMonth);
    remaining -= maxForMonth;
  }
  while (remaining > 0) {
    const idx = Math.floor(Math.random() * 12);
    stats[idx]++;
    remaining--;
  }
  return stats;
};

/*
 * 编号规则：面对飞机方向（站在机头前看向机尾）
 * - 前起落架（前轮）保持独立编号：前-左、前-右
 * - 主起落架从右往左依次编号（面对飞机时，从右手边往左手边）
 *   = 飞机左侧（翼尖→机身）→ 飞机右侧（机身→翼尖）
 *   = z值从大到小排列
 */

export const aircraftModels: AircraftModel[] = [
  {
    id: 'A320',
    name: 'A320-200',
    manufacturer: 'Airbus',
    tireCount: 6,
    fuselageLength: 18,
    fuselageRadius: 1.95,
    wingSpan: 11.76,
    engineRadius: 1.2,
    tires: [
      // 前起落架（前轮）
      { id: '前-左', label: '前起落架-左轮', position: [5.5, -1.2, 0.9], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '前-右', label: '前起落架-右轮', position: [5.5, -1.2, -0.9], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      // 主起落架：面对飞机从右往左 = z从大到小
      // 左侧（z>0，外侧→内侧）
      { id: '2号', label: '主起落架-左内侧', position: [-1.5, -1.4, 2.8], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-15', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '1号', label: '主起落架-左外侧', position: [-1.5, -1.4, 4.2], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-14', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      // 右侧（z<0，内侧→外侧）
      { id: '3号', label: '主起落架-右内侧', position: [-1.5, -1.4, -2.8], rotation: [0, 0, Math.PI / 2], damageCount: 8, lastInspect: '2026-06-10', status: 'critical', damageHistory: generateDamageHistory(8), monthlyStats: generateMonthlyStats(8) },
      { id: '4号', label: '主起落架-右外侧', position: [-1.5, -1.4, -4.2], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-12', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
    ],
  },
  {
    id: 'B737',
    name: 'B737-800',
    manufacturer: 'Boeing',
    tireCount: 6,
    fuselageLength: 19.5,
    fuselageRadius: 2.0,
    wingSpan: 12.3,
    engineRadius: 1.15,
    tires: [
      { id: '前-左', label: '前起落架-左轮', position: [6.0, -1.2, 0.85], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-19', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '前-右', label: '前起落架-右轮', position: [6.0, -1.2, -0.85], rotation: [0, 0, Math.PI / 2], damageCount: 0, lastInspect: '2026-06-21', status: 'normal', damageHistory: [], monthlyStats: generateMonthlyStats(0) },
      // 主起落架：面对飞机从右往左 = z从大到小
      { id: '2号', label: '主起落架-左内侧', position: [-1.2, -1.4, 2.6], rotation: [0, 0, Math.PI / 2], damageCount: 6, lastInspect: '2026-06-16', status: 'warning', damageHistory: generateDamageHistory(6), monthlyStats: generateMonthlyStats(6) },
      { id: '1号', label: '主起落架-左外侧', position: [-1.2, -1.4, 3.9], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '3号', label: '主起落架-右内侧', position: [-1.2, -1.4, -2.6], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-17', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      { id: '4号', label: '主起落架-右外侧', position: [-1.2, -1.4, -3.9], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-22', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
    ],
  },
  {
    id: 'A330',
    name: 'A330-300',
    manufacturer: 'Airbus',
    tireCount: 10,
    fuselageLength: 24.5,
    fuselageRadius: 2.65,
    wingSpan: 16.1,
    engineRadius: 1.65,
    tires: [
      { id: '前-左', label: '前起落架-左轮', position: [7.5, -1.4, 1.1], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-21', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      { id: '前-右', label: '前起落架-右轮', position: [7.5, -1.4, -1.1], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-19', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      // 主起落架：面对飞机从右往左 = z从大到小
      // 左侧（z>0，翼尖→机身）
      { id: '4号', label: '主起落架-左4', position: [-2.0, -1.6, 3.2], rotation: [0, 0, Math.PI / 2], damageCount: 7, lastInspect: '2026-06-14', status: 'critical', damageHistory: generateDamageHistory(7), monthlyStats: generateMonthlyStats(7) },
      { id: '3号', label: '主起落架-左3', position: [-2.0, -1.6, 4.8], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-13', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '2号', label: '主起落架-左2', position: [-2.0, -1.6, 6.0], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '1号', label: '主起落架-左1', position: [-2.0, -1.6, 7.2], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-16', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      // 右侧（z<0，机身→翼尖）
      { id: '5号', label: '主起落架-右1', position: [-2.0, -1.6, -3.2], rotation: [0, 0, Math.PI / 2], damageCount: 6, lastInspect: '2026-06-15', status: 'warning', damageHistory: generateDamageHistory(6), monthlyStats: generateMonthlyStats(6) },
      { id: '6号', label: '主起落架-右2', position: [-2.0, -1.6, -4.8], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '7号', label: '主起落架-右3', position: [-2.0, -1.6, -6.0], rotation: [0, 0, Math.PI / 2], damageCount: 9, lastInspect: '2026-06-11', status: 'critical', damageHistory: generateDamageHistory(9), monthlyStats: generateMonthlyStats(9) },
      { id: '8号', label: '主起落架-右4', position: [-2.0, -1.6, -7.2], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-17', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
    ],
  },
  {
    id: 'B777',
    name: 'B777-300ER',
    manufacturer: 'Boeing',
    tireCount: 14,
    fuselageLength: 31.0,
    fuselageRadius: 2.85,
    wingSpan: 19.4,
    engineRadius: 2.0,
    tires: [
      { id: '前-左', label: '前起落架-左轮', position: [9.5, -1.5, 1.2], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '前-右', label: '前起落架-右轮', position: [9.5, -1.5, -1.2], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      // 主起落架：面对飞机从右往左 = z从大到小
      // 左侧（z>0，翼尖→机身）
      { id: '6号', label: '主起落架-左6', position: [-3.0, -1.8, 3.5], rotation: [0, 0, Math.PI / 2], damageCount: 8, lastInspect: '2026-06-12', status: 'critical', damageHistory: generateDamageHistory(8), monthlyStats: generateMonthlyStats(8) },
      { id: '5号', label: '主起落架-左5', position: [-3.0, -1.8, 5.0], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-16', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      { id: '4号', label: '主起落架-左4', position: [-3.0, -1.8, 6.2], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-19', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '3号', label: '主起落架-左3', position: [-3.0, -1.8, 7.7], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-14', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '2号', label: '主起落架-左2', position: [-3.0, -1.8, 8.9], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-21', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '1号', label: '主起落架-左1', position: [-3.0, -1.8, 10.4], rotation: [0, 0, Math.PI / 2], damageCount: 6, lastInspect: '2026-06-13', status: 'warning', damageHistory: generateDamageHistory(6), monthlyStats: generateMonthlyStats(6) },
      // 右侧（z<0，机身→翼尖）
      { id: '7号', label: '主起落架-右1', position: [-3.0, -1.8, -3.5], rotation: [0, 0, Math.PI / 2], damageCount: 7, lastInspect: '2026-06-15', status: 'critical', damageHistory: generateDamageHistory(7), monthlyStats: generateMonthlyStats(7) },
      { id: '8号', label: '主起落架-右2', position: [-3.0, -1.8, -5.0], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '9号', label: '主起落架-右3', position: [-3.0, -1.8, -6.2], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-17', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      { id: '10号', label: '主起落架-右4', position: [-3.0, -1.8, -7.7], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-22', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      { id: '11号', label: '主起落架-右5', position: [-3.0, -1.8, -8.9], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-14', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '12号', label: '主起落架-右6', position: [-3.0, -1.8, -10.4], rotation: [0, 0, Math.PI / 2], damageCount: 9, lastInspect: '2026-06-10', status: 'critical', damageHistory: generateDamageHistory(9), monthlyStats: generateMonthlyStats(9) },
    ],
  },
  {
    id: 'A380',
    name: 'A380-800',
    manufacturer: 'Airbus',
    tireCount: 21,
    fuselageLength: 34.0,
    fuselageRadius: 3.55,
    wingSpan: 22.1,
    engineRadius: 1.85,
    tires: [
      { id: '前-左', label: '前起落架-左轮', position: [10.5, -1.6, 1.3], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-21', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      { id: '前-中', label: '前起落架-中轮', position: [10.5, -1.6, 0], rotation: [0, 0, Math.PI / 2], damageCount: 0, lastInspect: '2026-06-22', status: 'normal', damageHistory: [], monthlyStats: generateMonthlyStats(0) },
      { id: '前-右', label: '前起落架-右轮', position: [10.5, -1.6, -1.3], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-19', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      // 主起落架：面对飞机从右往左 = z从大到小
      // 左侧机翼下（z>0，翼尖→机身）
      { id: '5号', label: '机翼主起落架-左5', position: [-4.0, -1.8, 7.5], rotation: [0, 0, Math.PI / 2], damageCount: 8, lastInspect: '2026-06-12', status: 'critical', damageHistory: generateDamageHistory(8), monthlyStats: generateMonthlyStats(8) },
      { id: '4号', label: '机翼主起落架-左4', position: [-4.0, -1.8, 8.7], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-17', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      { id: '3号', label: '机翼主起落架-左3', position: [-4.0, -1.8, 9.9], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-19', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '2号', label: '机翼主起落架-左2', position: [-4.0, -1.8, 11.1], rotation: [0, 0, Math.PI / 2], damageCount: 7, lastInspect: '2026-06-13', status: 'critical', damageHistory: generateDamageHistory(7), monthlyStats: generateMonthlyStats(7) },
      { id: '1号', label: '机翼主起落架-左1', position: [-4.0, -1.8, 12.3], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      // 左侧机身下（z>0，继续往机身方向）
      { id: '9号', label: '机身主起落架-左4', position: [-2.0, -1.8, 3.0], rotation: [0, 0, Math.PI / 2], damageCount: 6, lastInspect: '2026-06-15', status: 'warning', damageHistory: generateDamageHistory(6), monthlyStats: generateMonthlyStats(6) },
      { id: '8号', label: '机身主起落架-左3', position: [-2.0, -1.8, 4.2], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '7号', label: '机身主起落架-左2', position: [-2.0, -1.8, 5.4], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-17', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
      { id: '6号', label: '机身主起落架-左1', position: [-2.0, -1.8, 6.6], rotation: [0, 0, Math.PI / 2], damageCount: 1, lastInspect: '2026-06-22', status: 'normal', damageHistory: generateDamageHistory(1), monthlyStats: generateMonthlyStats(1) },
      // 右侧机身下（z<0，机身→外侧）
      { id: '10号', label: '机身主起落架-右1', position: [-2.0, -1.8, -3.0], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-14', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '11号', label: '机身主起落架-右2', position: [-2.0, -1.8, -4.2], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-20', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '12号', label: '机身主起落架-右3', position: [-2.0, -1.8, -5.4], rotation: [0, 0, Math.PI / 2], damageCount: 3, lastInspect: '2026-06-18', status: 'normal', damageHistory: generateDamageHistory(3), monthlyStats: generateMonthlyStats(3) },
      { id: '13号', label: '机身主起落架-右4', position: [-2.0, -1.8, -6.6], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-15', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      // 右侧机翼下（z<0，继续往翼尖方向）
      { id: '14号', label: '机翼主起落架-右1', position: [-4.0, -1.8, -7.5], rotation: [0, 0, Math.PI / 2], damageCount: 5, lastInspect: '2026-06-16', status: 'warning', damageHistory: generateDamageHistory(5), monthlyStats: generateMonthlyStats(5) },
      { id: '15号', label: '机翼主起落架-右2', position: [-4.0, -1.8, -8.7], rotation: [0, 0, Math.PI / 2], damageCount: 2, lastInspect: '2026-06-21', status: 'normal', damageHistory: generateDamageHistory(2), monthlyStats: generateMonthlyStats(2) },
      { id: '16号', label: '机翼主起落架-右3', position: [-4.0, -1.8, -9.9], rotation: [0, 0, Math.PI / 2], damageCount: 6, lastInspect: '2026-06-14', status: 'warning', damageHistory: generateDamageHistory(6), monthlyStats: generateMonthlyStats(6) },
      { id: '17号', label: '机翼主起落架-右4', position: [-4.0, -1.8, -11.1], rotation: [0, 0, Math.PI / 2], damageCount: 9, lastInspect: '2026-06-11', status: 'critical', damageHistory: generateDamageHistory(9), monthlyStats: generateMonthlyStats(9) },
      { id: '18号', label: '机翼主起落架-右5', position: [-4.0, -1.8, -12.3], rotation: [0, 0, Math.PI / 2], damageCount: 4, lastInspect: '2026-06-16', status: 'warning', damageHistory: generateDamageHistory(4), monthlyStats: generateMonthlyStats(4) },
    ],
  },
];

export const getAircraftById = (id: string): AircraftModel | undefined => {
  return aircraftModels.find(a => a.id === id);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'critical': return '#FF3B30';
    case 'warning': return '#FFD60A';
    default: return '#00D2FF';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'critical': return '严重';
    case 'warning': return '预警';
    default: return '正常';
  }
};
