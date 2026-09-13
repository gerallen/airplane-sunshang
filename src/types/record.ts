/** 伤口尺寸（单位 mm，可只填部分维度） */
export interface WoundSize {
  length?: number;  // 长
  width?: number;   // 宽
  depth?: number;   // 深
}

export interface TireWound {
  /** 损伤位置：机轮编号（如 "左前"、"1号"）或 "其他" */
  tireId: string;
  /** 损伤位置为"其他"时填写的具体损伤类目 */
  category?: string;
  size: WoundSize;
  type: 'cut' | 'puncture' | 'wear' | 'bulge' | 'crack';
  position: 'tread' | 'sidewall' | 'shoulder' | 'bead';
  /** 伤口附着物描述，如 "无附着物" */
  attachment?: string;
  description: string;
}

/** 一次降落后的检查记录（隶属于某架飞机） */
export interface FlightRecord {
  id: string;
  date: string;
  departure: string;
  landingRunway: string;
  /** 降落后滑行路线，如 "A5→B3→C2" */
  taxiRoute: string;
  /** 停机位，如 "W123" */
  parkingStand: string;
  /** 上次检查时间（ISO datetime，可选） */
  lastInspectTime?: string;
  /** FOD 期间是否有报警 */
  fodAlarm?: boolean;
  /** 事件通报时间 */
  reportTime?: string;
  /** 到达处理时间 */
  arriveTime?: string;
  /** 事件处理结束通报时间 */
  finishTime?: string;
  /** 航空公司，如 "顺丰航空" */
  airline?: string;
  /** 航班号，如 "O3182" */
  flightNo?: string;
  /** 到达机场，如 "鄂州" */
  arrival?: string;
  /** 落地时间，HH:mm */
  landingTime?: string;
  /** 上一次跑道巡查时间 */
  lastRunwayInspectTime?: string;
  /** 滑行道检查时间 */
  lastTaxiwayInspectTime?: string;
  wounds: TireWound[];
  status: 'normal' | 'warning' | 'critical';
}

/** 一架飞机（管理的基本资产单元） */
export interface Aircraft {
  id: string;
  aircraftNo: string;   // 如 B-2445
  modelId: string;      // 关联 aircraftModels
  records: FlightRecord[];
}

/** 格式化伤口尺寸为可读文本，如 "25×3mm" / "5mm（深）" / "25×3×5mm" */
export function formatWoundSize(size: WoundSize): string {
  const parts: string[] = [];
  const dims = [size.length, size.width, size.depth].filter((v): v is number => v !== undefined && v !== null);
  if (dims.length === 0) return '—';
  if (size.length !== undefined) parts.push(`${size.length}`);
  if (size.width !== undefined) parts.push(`${size.width}`);
  if (size.depth !== undefined) parts.push(`${size.depth}`);
  return `${parts.join('×')}mm`;
}
