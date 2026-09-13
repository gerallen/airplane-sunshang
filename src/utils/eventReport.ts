import type { Aircraft, FlightRecord } from '@/types';
import { getModelName } from '@/data/aircraftData';

/** "2026-09-06" → "2026年9月6日" */
function fmtDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
}

/** "19:16" 或 "2026-09-06T19:16" → "1916"；空值返回 "____" */
function fmtHHmm(t?: string): string {
  if (!t) return '____';
  const time = t.includes('T') ? t.split('T')[1] : t;
  return time.slice(0, 5).replace(':', '');
}

/** "跑道19L" → "19L" */
function runwayDir(runway: string): string {
  return runway.replace(/^跑道/, '');
}

/** 损伤部位描述，如 "飞机一号轮" / "轮毂" */
function woundTarget(w: FlightRecord['wounds'][number]): string {
  if (w.tireId === '其他') return w.category ?? '其他部位';
  return `飞机${w.tireId}轮`;
}

export function generateEventReport(aircraft: Aircraft, record: FlightRecord): string {
  const firstWound = record.wounds[0];
  const modelName = getModelName(aircraft.modelId);
  const fodText = record.fodAlarm ? '有实物报警' : '无实物报警';

  const dims = firstWound
    ? [firstWound.size.length, firstWound.size.width, firstWound.size.depth].filter(v => v !== undefined)
    : [];
  const sizeText = dims.length ? `${dims.join('*')}mm` : '____';
  const woundSentence = firstWound
    ? `经现场查看，${woundTarget(firstWound)}有损伤，损伤尺寸为 ${sizeText}，伤口${firstWound.attachment ?? '无附着物'}`
    : '经现场查看，未发现明显损伤';

  const headerParts = [
    fmtDate(record.date),
    record.airline ?? '____',
    `${aircraft.aircraftNo}号/${modelName}机型`,
    `执行${record.departure}至${record.arrival ?? '____'}航班`,
    record.flightNo ?? '____',
    `${firstWound ? woundTarget(firstWound).replace(/^飞机/, '').replace(/轮$/, '轮胎') : '航空器'}损伤。`,
  ];

  return `【事件通报】
${headerParts.join('')}
简要经过：
${fmtHHmm(record.landingTime)}分，${record.flightNo ?? '____'}飞机由${runwayDir(record.landingRunway)}方向落地，滑行路线${record.taxiRoute}，停机位${record.parkingStand}；
${fmtHHmm(record.reportTime)}分，接调度通知该航班${firstWound ? woundTarget(firstWound).replace(/^飞机/, '') : '航空器'}损伤；
${fmtHHmm(record.arriveTime)}分，场务到达现场，${woundSentence}；
${fmtHHmm(record.finishTime)}分，场务与机务签字确认，一致认为该事件为非外来物损伤航空器事件，场务将处置结果通报指挥调度。
道面相关情况：上一次东跑道巡查时间为${fmtHHmm(record.lastRunwayInspectTime)}，滑行道检查时间为${fmtHHmm(record.lastTaxiwayInspectTime)}，${fmtHHmm(record.lastRunwayInspectTime)}分至轮胎损伤时间内，FOD系统${fodText}；相关区域清扫周期正常，保洁工作正常。`;
}
