import { motion } from 'framer-motion'
import {
  Database, Image as ImageIcon, Tag, Layers,
  Bot, Brain, Search, CheckCircle, Activity,
} from 'lucide-react'
import { knowledgeBase } from '../data/dashboardData'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Database, ImageIcon, Tag, Layers, Bot, Brain, Search, CheckCircle, Activity,
}

export function AIKnowledge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70 h-full"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">AI Knowledge Base</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800">Tanishq Jewellery Catalog</h3>
        </div>
        <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {knowledgeBase.map((row, i) => {
          const Icon = ICONS[row.icon] ?? Database
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.04 }}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-[#6D213C]/50 group-hover:text-[#6D213C]/80 transition-colors" />
                <span className="text-[11px] text-gray-500">{row.label}</span>
              </div>

              {row.type === 'badge-green' && (
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {row.value}
                </span>
              )}
              {row.type === 'badge-blue' && (
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {row.value}
                </span>
              )}
              {!row.type && (
                <span className="text-[11px] font-semibold text-gray-700">{row.value}</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
