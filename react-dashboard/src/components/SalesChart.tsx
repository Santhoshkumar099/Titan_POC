import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { salesData } from '../data/dashboardData'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-gray-500">{entry.name}:</span>
          <span className="text-xs font-bold" style={{ color: entry.color }}>₹{entry.value}Cr</span>
        </div>
      ))}
    </div>
  )
}

export function SalesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.28 }}
      className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/70 h-full"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Sales Performance</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800">Monthly Jewellery Sales Trend</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">FY 2025–26 · Revenue in ₹ Crores</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700">+24% YoY</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6D213C" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6D213C" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#C8A24A" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#C8A24A" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5EEE4" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `₹${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5D5C0', strokeWidth: 1 }} />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
            iconType="circle" iconSize={7}
          />
          <Area
            type="monotone"
            dataKey="sales"
            name="Actual Sales"
            stroke="#6D213C"
            strokeWidth={2.5}
            fill="url(#gradSales)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#6D213C' }}
          />
          <Area
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#C8A24A"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#gradTarget)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#C8A24A' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
