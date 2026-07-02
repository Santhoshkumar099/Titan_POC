import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  TrendingUp, TrendingDown,
  Package, Boxes, Gem, Target, Zap, Bot, Brain,
  Image as ImageIcon,
} from 'lucide-react'
import type { KPICardData } from '../types'

// Lucide icon registry
const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Package, Boxes, Gem, Target, Zap, Bot, Brain, ImageIcon,
}

interface KPICardProps {
  data: KPICardData
  index: number
}

export function KPICard({ data, index }: KPICardProps) {
  const Icon = ICONS[data.icon] ?? Package
  const isPositive = (data.trend ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-2xl p-4 shadow-card border border-gray-100/70 overflow-hidden group cursor-default"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Gradient top-bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}55)` }}
      />

      {/* BG glow blob */}
      <div
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300"
        style={{ background: data.accentColor }}
      />

      {/* Header row: icon + trend */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ backgroundColor: data.iconBg }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: data.accentColor }} />
        </div>

        {data.trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {Math.abs(data.trend)}%
          </span>
        )}
      </div>

      {/* Primary value */}
      <div className="mb-0.5">
        {data.isText ? (
          <p className="text-[22px] font-extrabold text-gray-900 leading-none">
            {data.displayValue}
          </p>
        ) : (
          <p className="text-[22px] font-extrabold text-gray-900 leading-none tabular-nums">
            {data.prefix}
            <CountUp
              end={data.numericValue}
              duration={2.2}
              decimals={data.decimals ?? 0}
              separator=","
              enableScrollSpy
              scrollSpyOnce
            />
            {data.suffix}
          </p>
        )}
      </div>

      {/* Label */}
      <p className="text-[11px] font-semibold text-gray-500 mt-1">{data.title}</p>

      {/* Sub-text */}
      {data.subText && (
        <p className="text-[10px] text-gray-380 mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
          {data.isText ? data.subText : data.trendLabel}
        </p>
      )}
      {!data.isText && data.trendLabel && !data.subText && (
        <p className="text-[10px] mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
          {data.trendLabel}
        </p>
      )}
    </motion.div>
  )
}
