// ═══════════════════════════════════════════════════════════
// Tanishq Jewellery Intelligence Dashboard — Root App
// ═══════════════════════════════════════════════════════════
import { Header }         from './components/Header'
import { KPICard }        from './components/KPICard'
import { SalesChart }     from './components/SalesChart'
import { CategoryChart }  from './components/CategoryChart'
import { GenderChart }    from './components/GenderChart'
import { MaterialChart }  from './components/MaterialChart'
import { PipelineStatus } from './components/PipelineStatus'
import { AIKnowledge }    from './components/AIKnowledge'
import { QualityMetrics } from './components/QualityMetrics'
import { Timeline }       from './components/Timeline'
import { StoreTable }     from './components/StoreTable'
import { AIInsights }     from './components/AIInsights'
import { SystemHealth }   from './components/SystemHealth'
import { Footer }         from './components/Footer'
import { kpiCards }       from './data/dashboardData'

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">

      {/* ── Sticky Header ── */}
      <Header />

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 md:px-6 py-5 space-y-5 max-w-[1920px] mx-auto w-full">

        {/* ── 1. KPI Cards — 6 cards: 2 col mobile → 3 col tablet → 6 col desktop ── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((card, i) => (
            <KPICard key={card.id} data={card} index={i} />
          ))}
        </section>

        {/* ── 2. Sales Chart + Pipeline Status ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <PipelineStatus />
          </div>
        </section>

        {/* ── 3. Distribution Charts ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CategoryChart />
          <GenderChart   />
          <MaterialChart />
        </section>

        {/* ── 4. AI Knowledge + Quality Gauges + Activity Timeline ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AIKnowledge    />
          <QualityMetrics />
          <Timeline       />
        </section>

        {/* ── 5. Store Overview Table ── */}
        <section>
          <StoreTable />
        </section>

        {/* ── 6. AI Insights Cards ── */}
        <section>
          <AIInsights />
        </section>

        {/* ── 7. System Health ── */}
        <section>
          <SystemHealth />
        </section>

      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
