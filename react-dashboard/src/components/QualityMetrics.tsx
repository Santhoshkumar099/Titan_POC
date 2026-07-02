import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
} from 'recharts'
import { Gauge } from 'lucide-react'
import { qualityGauges } from '../data/dashboardData'
import type { QualityGaugeData } from '../types'

interface GaugePanelProps {
  data: QualityGaugeData
  index: number
}

function GaugePanel({ data, index }: GaugePanelProps) {
  const chartData = [{ value: data.value, fill: data.color }]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.58 + index * 0.1 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-full h-20">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="92%"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={chartData}
            barSize={10}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#F0EBE3' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Value overlay */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <span className="text-[15px] font-extrabold" style={{ color: data.color }}>
            {data.value}%
          </span>
        </div>
      </div>

      <p className="text-[9.5px] text-center text-gray-500 mt-1 leading-tight px-1 font-medium">
        {data.label}
      </p>
    </motion.div>
  )
}

export function QualityMetrics() {
  const overall = Math.round(
    qualityGauges.reduce((s, g) => s + g.value, 0) / qualityGauges.length * 10
  ) / 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.54 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70 h-full"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Quality KPIs</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-4">Product Quality Metrics</h3>

      <div className="grid grid-cols-2 gap-3">
        {qualityGauges.map((g, i) => (
          <GaugePanel key={i} data={g} index={i} />
        ))}
      </div>

      {/* Overall score bar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 font-medium">Overall Score</span>
          <span className="text-[11px] font-extrabold text-[#6D213C]">{overall}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overall}%` }}
            transition={{ duration: 1.4, delay: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6D213C, #C8A24A)' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
