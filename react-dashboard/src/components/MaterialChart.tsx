import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Layers } from 'lucide-react'
import { materialData } from '../data/dashboardData'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3">
      <p className="text-[10px] font-bold text-gray-400 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: entry.fill }} />
          <span className="text-[10px] text-gray-500">{entry.name}</span>
          <span className="text-[10px] font-bold text-gray-700">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

const MATERIALS = [
  { key: 'yellowGold', name: 'Yellow Gold', color: '#D4AF37' },
  { key: 'roseGold',   name: 'Rose Gold',   color: '#C8902A' },
  { key: 'whiteGold',  name: 'White Gold',  color: '#B8B0A4' },
  { key: 'platinum',   name: 'Platinum',    color: '#8A8A9A' },
]

export function MaterialChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.48 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Materials</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-3">Material Colour Distribution</h3>

      <ResponsiveContainer width="100%" height={196}>
        <BarChart data={materialData} margin={{ top: 0, right: 4, left: -8, bottom: 0 }} barCategoryGap="35%">
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: '9.5px', paddingTop: '8px' }}
            iconType="square" iconSize={8}
            formatter={(value: string) => <span className="text-gray-500">{value}</span>}
          />
          {MATERIALS.map((m, i) => (
            <Bar
              key={m.key}
              dataKey={m.key}
              name={m.name}
              stackId="a"
              fill={m.color}
              radius={i === MATERIALS.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
