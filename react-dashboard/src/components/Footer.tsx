import { motion } from 'framer-motion'
import { Brain, Globe, Sparkles, Shield } from 'lucide-react'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.85 }}
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3D0F22 0%, #6D213C 50%, #4A1628 100%)' }}
    >
      {/* Shimmer top border */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C8A24A]/60 to-transparent" />

      {/* Decorative rings */}
      <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-[#C8A24A]/8 pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 px-6 py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8A24A] to-[#9A6E20] flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0">
              <span className="text-white font-black text-base leading-none">T</span>
            </div>
            <div>
              <p className="text-white font-bold text-[13px]">Tanishq Jewellery Intelligence Platform</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3 text-white/40" />
                <p className="text-white/45 text-[10px]">Powered by Global WeConnect Technologies (GWC)</p>
              </div>
            </div>
          </div>

          {/* Center: Tech stack */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[#C8A24A]" />
              </div>
              <div>
                <p className="text-[9px] text-white/35 uppercase tracking-wider font-semibold">AI Stack</p>
                <p className="text-[11px] text-white/75 font-semibold">GWC Vision Language Model</p>
              </div>
            </div>

            <div className="h-7 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A24A]" />
              </div>
              <div>
                <p className="text-[9px] text-white/35 uppercase tracking-wider font-semibold">Last Updated</p>
                <p className="text-[11px] text-white/75 font-semibold">June 24, 2026</p>
              </div>
            </div>
          </div>

          {/* Right: Version badge */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#C8A24A]/60" />
            <div className="text-right">
              <p className="text-[9px] text-white/35 uppercase tracking-wider">Dashboard</p>
              <p className="text-[11px] text-[#C8A24A] font-bold">v2.0.0 Production</p>
            </div>
          </div>

        </div>
      </div>
    </motion.footer>
  )
}
