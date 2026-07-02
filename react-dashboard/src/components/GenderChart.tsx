import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Users } from 'lucide-react'
import { genderData } from '../data/dashboardData'

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2.5">
      <p className="text-xs font-bold" style={{ color: d.payload.color }}>
        {d.payload.gender}: {d.value}%
      </p>
    </div>
  )
}

export function GenderChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.42 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Audience</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-3">Gender Distribution</h3>

      <ResponsiveContainer width="100%" height={196}>
        <BarChart
          data={genderData}
          layout="vertical"
          margin={{ top: 0, right: 36, left: 4, bottom: 0 }}
          barCategoryGap="28%"
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#9CA3AF' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="gender"
            tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 500 }}
            axisLine={false} tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="percentage" radius={[0, 5, 5, 0]} barSize={16}>
            {genderData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="percentage"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 10, fontWeight: 700, fill: '#4B5563' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
