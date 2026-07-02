import { motion } from 'framer-motion'
import {
  TrendingUp, Gem, ShieldCheck, CheckCircle, Search, Activity, Sparkles,
} from 'lucide-react'
import { insightData } from '../data/dashboardData'

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  TrendingUp, Gem, ShieldCheck, CheckCircle, Search, Activity,
}

export function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.66 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#C8A24A] to-[#6D213C]" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Intelligence</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800">AI Generated Insights</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FDF5E0] border border-[#C8A24A]/30 rounded-full px-3 py-1">
          <Sparkles className="w-3 h-3 text-[#C8A24A]" />
          <span className="text-[10px] font-bold text-[#9A6E20]">{insightData.length} Insights</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insightData.map((insight, i) => {
          const Icon = ICONS[insight.icon] ?? Activity
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.07 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="p-4 rounded-xl border border-gray-100 hover:border-[#C8A24A]/40 hover:shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #FAF7F2 100%)' }}
            >
              <div className="flex items-start gap-3">
                {/* Icon bubble */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: `${insight.color}12` }}
                >
                  <Icon className="w-4 h-4" style={{ color: insight.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Category tag */}
                  <span
                    className="inline-block text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                    style={{ background: `${insight.color}12`, color: insight.color }}
                  >
                    {insight.category}
                  </span>

                  {/* Text with highlighted value */}
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {insight.text.replace(insight.highlight, '')}
                    <span className="font-extrabold" style={{ color: insight.color }}>
                      {insight.highlight}
                    </span>
                    {/* Some text may have highlight at the end, which is fine */}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
