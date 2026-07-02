import { motion } from 'framer-motion'
import { Bell, Settings, Search, ChevronDown, Sparkles, ScanSearch } from 'lucide-react'

export function Header() {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-gradient-to-r from-[#4A1628] via-[#6D213C] to-[#5A1828] shadow-xl border-b border-white/10"
    >
      {/* Decorative shimmer line at top */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C8A24A] to-transparent opacity-60" />

      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">

          {/* ── Brand + Title ── */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo mark */}
            <div className="flex-shrink-0 bg-white rounded-md px-2 py-1">
              <img
                src={`${import.meta.env.BASE_URL}tanishq_logo.png`}
                alt="Tanishq"
                className="h-8 w-auto object-contain block"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-[15px] tracking-[0.03em] truncate">
                  Tanishq Jewellery Intelligence Dashboard
                </h1>
                <span className="flex-shrink-0 flex items-center gap-1 bg-[#C8A24A]/20 border border-[#C8A24A]/30 rounded-full px-2 py-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#C8A24A]" />
                  <span className="text-[#C8A24A] text-[9px] font-bold tracking-wide">AI POWERED</span>
                </span>
              </div>
              <p className="text-white/50 text-[10px] mt-0.5 tracking-wide truncate">
                AI-Powered Product Analytics · Visual Search · Metadata Intelligence · Retail Insights
              </p>
            </div>
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2.5 flex-shrink-0">

            {/* Visual Search link */}
            <a
              href="http://localhost:8000"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C8A24A]/50 bg-[#C8A24A]/15 text-[#C8A24A] hover:bg-[#C8A24A]/25 hover:border-[#C8A24A]/70 transition-all text-[11px] font-semibold tracking-wide flex-shrink-0"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>Visual Search</span>
            </a>

            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search products, stores..."
                className="
                  bg-white/10 border border-white/15 rounded-xl
                  pl-8 pr-4 py-2 text-[12px] text-white
                  placeholder:text-white/35
                  focus:outline-none focus:border-[#C8A24A]/50 focus:bg-white/15
                  transition-all w-52
                "
              />
            </div>

            {/* Date badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C8A24A] animate-pulse" />
              <span className="text-white/60 text-[10px] font-medium">{dateStr}</span>
            </div>

            {/* Notification bell */}
            <button className="relative p-2 rounded-xl bg-white/8 border border-white/12 text-white/60 hover:text-white hover:bg-white/15 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8A24A] rounded-full shadow shadow-[#C8A24A]/50" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-xl bg-white/8 border border-white/12 text-white/60 hover:text-white hover:bg-white/15 transition-all">
              <Settings className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A24A] to-[#9A6E20] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-black/20">
                A
              </div>
              <ChevronDown className="w-3 h-3 text-white/40 hidden md:block group-hover:text-white/70 transition-colors" />
            </div>

          </div>
        </div>
      </div>
    </motion.header>
  )
}
