import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, ArrowUpDown, ChevronUp, ChevronDown, MapPin } from 'lucide-react'
import { storeData } from '../data/dashboardData'
import type { StoreRow, SortDirection } from '../types'

type SortKey = keyof StoreRow

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'store',           label: 'Store'           },
  { key: 'products',        label: 'Products'        },
  { key: 'inventoryHealth', label: 'Inventory Health'},
  { key: 'sales',           label: 'Sales'           },
  { key: 'aiCoverage',      label: 'AI Coverage'     },
  { key: 'status',          label: 'Status'          },
]

const STATUS_STYLE: Record<StoreRow['status'], string> = {
  active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  maintenance: 'bg-amber-50   text-amber-700   border-amber-200',
  review:      'bg-blue-50    text-blue-700    border-blue-200',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-25" />
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-[#6D213C]" />
    : <ChevronDown className="w-3 h-3 text-[#6D213C]" />
}

export function StoreTable() {
  const [sortKey, setSortKey] = useState<SortKey>('store')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const rows = [...storeData].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey]
    const dir = sortDir === 'asc' ? 1 : -1
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
    return String(va).localeCompare(String(vb)) * dir
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.62 }}
      className="bg-white rounded-2xl shadow-card border border-gray-100/70 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.04)' }}
    >
      {/* Panel header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#6D213C] to-[#C8A24A]" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Store Performance</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800">Jewellery Store Overview</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <MapPin className="w-3 h-3 text-[#6D213C]" />
          {storeData.length} locations
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-5 py-3 text-left cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.08em] group-hover:text-[#6D213C] transition-colors">
                      {col.label}
                    </span>
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-gray-50 hover:bg-[#FAF7F2] transition-colors group"
                >
                  {/* Store name */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-[12.5px] font-semibold text-gray-800 group-hover:text-[#6D213C] transition-colors">
                        {row.store}
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {row.city}
                      </p>
                    </div>
                  </td>

                  {/* Products */}
                  <td className="px-5 py-4">
                    <span className="text-[12.5px] font-bold text-gray-800">
                      {row.products.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Inventory Health */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.inventoryHealth}%`,
                            background: row.inventoryHealth >= 98
                              ? '#22C55E'
                              : row.inventoryHealth >= 95
                              ? '#F59E0B'
                              : '#EF4444',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">{row.inventoryHealth}%</span>
                    </div>
                  </td>

                  {/* Sales */}
                  <td className="px-5 py-4">
                    <span className="text-[12.5px] font-extrabold text-[#6D213C]">{row.sales}</span>
                  </td>

                  {/* AI Coverage */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${row.aiCoverage === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className={`text-[11px] font-bold ${row.aiCoverage === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {row.aiCoverage}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
