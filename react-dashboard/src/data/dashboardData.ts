// ═══════════════════════════════════════════════
// Tanishq Jewellery Intelligence Dashboard
// All Mock Data — single source of truth
// Replace API calls here when integrating live backend
// ═══════════════════════════════════════════════

import type {
  KPICardData,
  SalesDataPoint,
  CategoryDataPoint,
  GenderDataPoint,
  MaterialDataPoint,
  StoreRow,
  TimelineEvent,
  InsightCard,
  SystemService,
  QualityGaugeData,
  KnowledgeBaseEntry,
} from '../types'

// ── KPI Cards ─────────────────────────────────────────────────────────────
export const kpiCards: KPICardData[] = [
  {
    id: 'total-products',
    title: 'Total Products',
    numericValue: 12584,
    decimals: 0,
    trend: 14.2,
    trendLabel: 'vs last month',
    icon: 'Package',
    accentColor: '#6D213C',
    iconBg: '#FEF0F4',
  },
  {
    id: 'categories',
    title: 'Categories',
    numericValue: 18,
    decimals: 0,
    trend: 2,
    trendLabel: 'new this quarter',
    icon: 'Boxes',
    accentColor: '#C8A24A',
    iconBg: '#FDF5E0',
  },
  {
    id: 'metal-types',
    title: 'Metal Types',
    numericValue: 4,
    decimals: 0,
    isText: true,
    displayValue: '4',
    subText: 'Gold · Diamond · Silver · Platinum',
    icon: 'Gem',
    accentColor: '#2E7D32',
    iconBg: '#E8F5E9',
  },
  {
    id: 'images-processed',
    title: 'Images Processed',
    numericValue: 12584,
    decimals: 0,
    trend: 8.3,
    trendLabel: 'fully indexed',
    icon: 'ImageIcon',
    accentColor: '#1565C0',
    iconBg: '#E3F2FD',
  },
  {
    id: 'retrieval-accuracy',
    title: 'Retrieval Accuracy',
    numericValue: 97.8,
    suffix: '%',
    decimals: 1,
    trend: 1.2,
    trendLabel: 'vs baseline',
    icon: 'Target',
    accentColor: '#00695C',
    iconBg: '#E0F2F1',
  },
  {
    id: 'ai-model',
    title: 'AI Model',
    numericValue: 0,
    isText: true,
    displayValue: 'GWC VLM',
    subText: 'Vision Language Model',
    icon: 'Bot',
    accentColor: '#E65100',
    iconBg: '#FFF3E0',
  },
]

// ── Monthly Sales ──────────────────────────────────────────────────────────
export const salesData: SalesDataPoint[] = [
  { month: 'Jan', sales: 1.8, target: 1.6 },
  { month: 'Feb', sales: 2.1, target: 1.9 },
  { month: 'Mar', sales: 1.9, target: 2.0 },
  { month: 'Apr', sales: 2.5, target: 2.2 },
  { month: 'May', sales: 2.8, target: 2.5 },
  { month: 'Jun', sales: 3.2, target: 2.8 },
  { month: 'Jul', sales: 3.0, target: 3.0 },
  { month: 'Aug', sales: 3.6, target: 3.2 },
  { month: 'Sep', sales: 3.9, target: 3.5 },
  { month: 'Oct', sales: 4.3, target: 3.8 },
  { month: 'Nov', sales: 4.8, target: 4.2 },
  { month: 'Dec', sales: 5.4, target: 4.8 },
]

// ── Category Distribution ──────────────────────────────────────────────────
export const categoryData: CategoryDataPoint[] = [
  { name: 'Necklace',  value: 32, color: '#6D213C' },
  { name: 'Ring',      value: 22, color: '#C8A24A' },
  { name: 'Earrings',  value: 18, color: '#8B2A4E' },
  { name: 'Bangles',   value: 14, color: '#D4AF37' },
  { name: 'Pendant',   value: 9,  color: '#B8860B' },
  { name: 'Others',    value: 5,  color: '#A0917E' },
]

// ── Gender Distribution ────────────────────────────────────────────────────
export const genderData: GenderDataPoint[] = [
  { gender: 'Women',  percentage: 72, color: '#6D213C' },
  { gender: 'Men',    percentage: 18, color: '#C8A24A' },
  { gender: 'Kids',   percentage: 5,  color: '#D4AF37' },
  { gender: 'Unisex', percentage: 5,  color: '#A0917E' },
]

// ── Material Colour ────────────────────────────────────────────────────────
export const materialData: MaterialDataPoint[] = [
  { quarter: 'Q1', yellowGold: 48, roseGold: 22, whiteGold: 20, platinum: 10 },
  { quarter: 'Q2', yellowGold: 46, roseGold: 24, whiteGold: 20, platinum: 10 },
  { quarter: 'Q3', yellowGold: 50, roseGold: 20, whiteGold: 22, platinum: 8  },
  { quarter: 'Q4', yellowGold: 47, roseGold: 23, whiteGold: 21, platinum: 9  },
]

// ── Store Overview ─────────────────────────────────────────────────────────
export const storeData: StoreRow[] = [
  { id: 1, store: 'Tanishq Chennai',    city: 'Chennai',   products: 1245, inventoryHealth: 98, sales: '₹2.4 Cr', aiCoverage: 100, status: 'active' },
  { id: 2, store: 'Tanishq Bangalore',  city: 'Bangalore', products: 1105, inventoryHealth: 97, sales: '₹2.1 Cr', aiCoverage: 100, status: 'active' },
  { id: 3, store: 'Tanishq Mumbai',     city: 'Mumbai',    products: 1420, inventoryHealth: 99, sales: '₹3.2 Cr', aiCoverage: 100, status: 'active' },
  { id: 4, store: 'Tanishq Hyderabad',  city: 'Hyderabad', products: 980,  inventoryHealth: 96, sales: '₹1.8 Cr', aiCoverage: 99,  status: 'active' },
  { id: 5, store: 'Tanishq Delhi',      city: 'New Delhi', products: 1312, inventoryHealth: 95, sales: '₹2.9 Cr', aiCoverage: 100, status: 'maintenance' },
]

// ── Pipeline Activity Timeline ─────────────────────────────────────────────
export const timelineData: TimelineEvent[] = [
  { id: 1, date: 'Today',       title: 'System Monitoring Active',   description: 'No pipeline execution — all metrics nominal',    type: 'info'      },
  { id: 2, date: '2 Days Ago',  title: 'Training Completed',          description: 'GWC VLM training pipeline finished in 18 mins',   type: 'success'   },
  { id: 3, date: '2 Days Ago',  title: '12,584 Images Trained',      description: 'All product images vectorized' ,       type: 'completed' },
  { id: 5, date: '3 Days Ago',  title: 'Image Quality Validation',    description: 'Quality pass — 99.1% images meeting standards',   type: 'success'   },
  { id: 6, date: '5 Days Ago',  title: 'New Collection Ingested',     description: 'Festive season collection — 214 new products',    type: 'info'      },
]

// ── AI Insights ────────────────────────────────────────────────────────────
export const insightData: InsightCard[] = [
  { id: 1, text: 'Diamond jewellery demand increased by 18% in the current quarter', highlight: '+18%',         icon: 'TrendingUp',  category: 'Demand',      color: '#6D213C' },
  { id: 2, text: 'Gold necklaces generate the highest revenue per SKU across all stores',  highlight: 'Highest',    icon: 'Gem',         category: 'Revenue',     color: '#C8A24A' },
  { id: 3, text: "Women's jewellery accounts for 72% of total inventory value",           highlight: '72%',         icon: 'ShieldCheck', category: 'Inventory',   color: '#8B2A4E' },
  { id: 4, text: 'Metadata quality score of 99% exceeds enterprise benchmark of 95%',    highlight: '99%',         icon: 'CheckCircle', category: 'Quality',     color: '#2E7D32' },
  { id: 5, text: 'Visual search retrieval accuracy stands at 97.8%, above industry avg', highlight: '97.8%',       icon: 'Search',      category: 'Performance', color: '#1565C0' },
  { id: 6, text: 'Zero pipeline failures in the last 30 days — 100% AI uptime achieved', highlight: '100% uptime', icon: 'Activity',    category: 'Reliability', color: '#00695C' },
]

// ── System Health ──────────────────────────────────────────────────────────
export const systemServices: SystemService[] = [
  { name: 'API Gateway',     status: 'online',    icon: 'Server',    latency: '12ms'  },
  { name: 'Database', status: 'healthy',   icon: 'Database',  latency: '4ms'   },
  { name: 'Image Storage',   status: 'healthy',   icon: 'HardDrive', latency: '8ms'   },
  { name: 'Search API',      status: 'running',   icon: 'Search',    latency: '41ms'  },
  { name: 'AI Model',        status: 'available', icon: 'Bot',       latency: '120ms' }
]

// ── Product Quality Gauges ─────────────────────────────────────────────────
export const qualityGauges: QualityGaugeData[] = [
  { label: 'Metadata Completeness',    value: 99, color: '#6D213C' },
  { label: 'Image Quality',             value: 96, color: '#C8A24A' },
  { label: 'Visual Similarity',         value: 98, color: '#2E7D32' },
  { label: 'Classification Confidence', value: 97, color: '#1565C0' },
]

// ── AI Knowledge Base ──────────────────────────────────────────────────────
export const knowledgeBase: KnowledgeBaseEntry[] = [
  { icon: 'Database',    label: 'Dataset',             value: 'Tanishq Jewellery Catalog' },
  { icon: 'ImageIcon',   label: 'Total Images',         value: '12,584' },
  { icon: 'Layers',      label: 'Categories',           value: '18' },
  { icon: 'Bot',         label: 'AI Model',             value: 'GWC VLM' },
  { icon: 'CheckCircle', label: 'Metadata Status',      value: 'Completed',  type: 'badge-green' },
  { icon: 'Activity',    label: 'System Status',        value: 'Healthy',    type: 'badge-green' },
]
