import { motion } from 'framer-motion'
import {
  Server, Database, HardDrive, Search, Bot, Layers,
  Activity,
} from 'lucide-react'
import { systemServices } from '../data/dashboardData'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Server, Database, HardDrive, Search, Bot, Layers,
}

const STATUS: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  online:    { label: 'Online',    dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  healthy:   { label: 'Healthy',   dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  running:   { label: 'Running',   dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  available: { label: 'Available', dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  degraded:  { label: 'Degraded',  dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
}

export function SystemHealth() {
  const allHealthy = systemServices.every(s => s.status !== 'degraded')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100/70"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Infrastructure</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800">System Health</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700">
            {allHealthy ? 'All Systems Operational' : 'Partial Degradation'}
          </span>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {systemServices.map((svc, i) => {
          const Icon = ICONS[svc.icon] ?? Server
          const cfg = STATUS[svc.status]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 + i * 0.07 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className={`rounded-xl p-4 border text-center cursor-pointer transition-shadow hover:shadow-md ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex justify-center mb-2">
                <div className={`w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.text}`} />
                </div>
              </div>
              <p className={`text-[10.5px] font-bold ${cfg.text} mb-1.5 leading-tight`}>{svc.name}</p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                <span className={`text-[9px] font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
              {svc.latency && (
                <p className={`text-[9px] opacity-60 ${cfg.text}`}>{svc.latency}</p>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
