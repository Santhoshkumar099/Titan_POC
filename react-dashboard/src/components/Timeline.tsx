import { motion } from 'framer-motion'
import { CheckCircle2, Info, Workflow } from 'lucide-react'
import { timelineData } from '../data/dashboardData'
import type { TimelineEvent } from '../types'

const TYPE_CONFIG: Record<TimelineEvent['type'], {
  dot: string; ring: string; icon: React.ComponentType<any>; iconColor: string; bg: string
}> = {
  success:   { dot: 'bg-emerald-500', ring: 'ring-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50'  },
  info:      { dot: 'bg-blue-400',    ring: 'ring-blue-200',    icon: Info,         iconColor: 'text-blue-600',    bg: 'bg-blue-50'     },
  completed: { dot: 'bg-[#6D213C]',   ring: 'ring-[#6D213C]/20',icon: CheckCircle2, iconColor: 'text-[#6D213C]',  bg: 'bg-[#FEF0F4]'  },
  warning:   { dot: 'bg-amber-500',   ring: 'ring-amber-200',   icon: Info,         iconColor: 'text-amber-600',   bg: 'bg-amber-50'    },
}

export function Timeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.58 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70 h-full"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Activity Log</span>
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Pipeline Activity</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[#6D213C]/25 via-[#C8A24A]/15 to-transparent" />

        <div className="space-y-3">
          {timelineData.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type]
            const Icon = cfg.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62 + i * 0.07 }}
                className="flex gap-3"
              >
                {/* Dot */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cfg.bg} ring-2 ${cfg.ring} z-10`}>
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold text-gray-800 leading-snug">{item.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                    <span className="text-[9.5px] text-gray-400 whitespace-nowrap flex-shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-md">
                      {item.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
