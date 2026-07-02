import { motion } from 'framer-motion'
import {
  Activity, Cpu, Image as ImageIcon,
  Calendar, Clock, CheckCircle2, RefreshCw,
} from 'lucide-react'

const METRICS = [
  { icon: Cpu,        label: 'Model',    value: 'GWC VLM',    progress: null },
  { icon: ImageIcon,  label: 'Images',   value: '12,584',     progress: 100  },
  { icon: Calendar,   label: 'Last Run', value: '2 Days Ago', progress: null },
  { icon: Clock,      label: 'Duration', value: '18 Mins',    progress: null },
]

export function PipelineStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.32 }}
      className="relative rounded-2xl overflow-hidden text-white h-full"
      style={{ background: 'linear-gradient(145deg, #3D0F22 0%, #6D213C 45%, #4A1628 100%)' }}
    >
      {/* Decorative rings */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-[#C8A24A]/10 pointer-events-none" />
      <div className="absolute -right-4  -top-4  w-24 h-24 rounded-full border border-[#C8A24A]/15 pointer-events-none" />
      <div className="absolute right-4   bottom-4 w-12 h-12 rounded-full bg-[#C8A24A]/5 pointer-events-none" />

      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity className="w-3.5 h-3.5 text-[#C8A24A]" />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.1em]">AI Pipeline</span>
            </div>
            <h3 className="text-sm font-bold text-white">Pipeline Health Status</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 tracking-wide">HEALTHY</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="bg-white/8 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon className="w-3.5 h-3.5 text-[#C8A24A]/80" />
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{m.label}</span>
              </div>
              <div>
                <p className="text-[17px] font-extrabold text-white leading-none tracking-tight">{m.value}</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: m.progress !== null ? `${m.progress}%` : '0%' }}
                    transition={{ duration: 1.0, delay: 0.7 + i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: m.progress !== null
                        ? 'linear-gradient(90deg, #C8A24A, #EDD898)'
                        : 'transparent',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-white/60">Training Completed · June 24, 2026</span>
          </div>
          <button className="flex items-center gap-1 text-[10px] text-[#C8A24A] hover:text-[#EDD898] transition-colors">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>
    </motion.div>
  )
}
