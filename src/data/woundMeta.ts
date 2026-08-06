/** Centralized lookup maps for O(1) wound metadata access. */

export const WOUND_TYPE_MAP: Record<string, string> = {
  cut: '划伤',
  puncture: '扎伤',
  wear: '磨损',
  bulge: '鼓包',
  crack: '裂纹',
};

export const WOUND_POSITION_MAP: Record<string, string> = {
  tread: '胎冠',
  sidewall: '胎侧',
  shoulder: '胎肩',
  bead: '胎圈',
};

export const SEVERITY_MAP: Record<string, string> = {
  low: '轻微',
  medium: '中等',
  high: '严重',
};

export const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  low:    { color: '#00D2FF', bg: 'rgba(0,210,255,0.15)' },
  medium: { color: '#FFD60A', bg: 'rgba(255,214,10,0.15)' },
  high:   { color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
};

/** Dropdown options derived from maps (for select inputs). */
export const WOUND_TYPE_OPTIONS = Object.entries(WOUND_TYPE_MAP).map(([value, label]) => ({ value, label }));
export const WOUND_POSITION_OPTIONS = Object.entries(WOUND_POSITION_MAP).map(([value, label]) => ({ value, label }));
export const SEVERITY_OPTIONS = Object.entries(SEVERITY_MAP).map(([value, label]) => ({ value, label }));
