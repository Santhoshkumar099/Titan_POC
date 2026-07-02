import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { categoryData } from '../data/dashboardData'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2.5">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.color }} />
        <span className="text-xs font-semibold text-gray-700">{d.name}</span>
        <span className="text-xs font-bold" style={{ color: d.payload.color }}>{d.value}%</span>
      </div>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, value }: any) => {
  if (value < 9) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 22
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#6B7280" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontWeight={600}
    >
      {value}%
    </text>
  )
}

export function CategoryChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.36 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Category Split</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-3">Category Distribution</h3>

      <ResponsiveContainer width="100%" height={196}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="44%"
            innerRadius={48}
            outerRadius={72}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            strokeWidth={2}
            stroke="#fff"
          >
            {categoryData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
            iconType="circle" iconSize={7}
            formatter={(value: string) => <span className="text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
