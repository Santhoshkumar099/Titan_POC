// ═══════════════════════════════════════════════
// Tanishq Jewellery Intelligence Dashboard
// Type Definitions
// ═══════════════════════════════════════════════

export interface KPICardData {
  id: string;
  title: string;
  numericValue: number;
  displayValue?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  isText?: boolean;
  subText?: string;
  trend?: number;
  trendLabel?: string;
  icon: string;
  accentColor: string;
  iconBg: string;
}

export interface SalesDataPoint {
  month: string;
  sales: number;
  target: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface GenderDataPoint {
  gender: string;
  percentage: number;
  color: string;
}

export interface MaterialDataPoint {
  quarter: string;
  yellowGold: number;
  roseGold: number;
  whiteGold: number;
  platinum: number;
}

export interface StoreRow {
  id: number;
  store: string;
  city: string;
  products: number;
  inventoryHealth: number;
  sales: string;
  aiCoverage: number;
  status: 'active' | 'maintenance' | 'review';
}

export interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'completed' | 'warning';
}

export interface InsightCard {
  id: number;
  text: string;
  highlight: string;
  icon: string;
  category: string;
  color: string;
}

export interface SystemService {
  name: string;
  status: 'online' | 'healthy' | 'running' | 'available' | 'degraded';
  icon: string;
  latency?: string;
}

export interface QualityGaugeData {
  label: string;
  value: number;
  color: string;
}

export interface KnowledgeBaseEntry {
  label: string;
  value: string;
  type?: 'badge-green' | 'badge-blue' | 'normal';
  icon: string;
}

export type SortDirection = 'asc' | 'desc';
