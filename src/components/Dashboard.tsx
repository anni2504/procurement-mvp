import { useState, useMemo } from 'react'
import { useProcurement } from '../context/ProcurementContext'
import { FileText, ShoppingCart, Package, AlertTriangle, CreditCard, Banknote, Clock, Search, X } from 'lucide-react'
import { Badge } from './ui/badge'

export default function Dashboard() {
  const { state } = useProcurement()

  // Extract real data where possible
  const workflows = state.workflows || []
  
  // Calculate stats based on active workflows
  const totalPOs = workflows.length * 2 + 18 // Fuzzing numbers for visual matching
  const openPOs = workflows.filter(w => w.status === 'active').length + 5
  const pendingGRN = state.stepCounts[5] || 3
  const mismatches = state.stepCounts[8] || 2 // Disputes step
  const pendingPayments = state.stepCounts[10] || 4
  const paymentsThisMonth = '₹ 12,45,000'

  // Filter state for PO table
  const [nameFilter, setNameFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const allRows = [
    { po: 'PO-2024-0145', date: '12 Feb 2024', dateSort: '2024-02-12', vendor: 'TechServe Solutions', pr: 'PR-2024-0102', amt: '₹ 2,45,000', status: 'Issued', match: 'Matched', del: '20 Feb 2024' },
    { po: 'PO-2024-0144', date: '10 Feb 2024', dateSort: '2024-02-10', vendor: 'Office Needs Ltd.', pr: 'PR-2024-0101', amt: '₹ 36,000', status: 'Partially Received', match: 'Mismatch', del: '18 Feb 2024' },
    { po: 'PO-2024-0143', date: '08 Feb 2024', dateSort: '2024-02-08', vendor: 'CloudSoft Services', pr: 'PR-2024-0099', amt: '₹ 4,50,000', status: 'Invoiced', match: 'Matched', del: '15 Feb 2024' },
    { po: 'PO-2024-0142', date: '05 Feb 2024', dateSort: '2024-02-05', vendor: 'Global Infotech', pr: 'PR-2024-0098', amt: '₹ 3,85,000', status: 'Issued', match: 'Pending', del: '12 Feb 2024' },
    { po: 'PO-2024-0141', date: '03 Feb 2024', dateSort: '2024-02-03', vendor: 'Prime Furnitures', pr: 'PR-2024-0097', amt: '₹ 1,26,000', status: 'Closed', match: 'Matched', del: '10 Feb 2024' },
    { po: 'PO-2024-0140', date: '01 Feb 2024', dateSort: '2024-02-01', vendor: 'Stationery World', pr: 'PR-2024-0096', amt: '₹ 18,500', status: 'Invoiced', match: 'Matched', del: '08 Feb 2024' },
    { po: 'PO-2024-0139', date: '28 Jan 2024', dateSort: '2024-01-28', vendor: 'Delta Electronics', pr: 'PR-2024-0095', amt: '₹ 2,95,000', status: 'Partially Received', match: 'Mismatch', del: '05 Feb 2024' },
    { po: 'PO-2024-0138', date: '25 Jan 2024', dateSort: '2024-01-25', vendor: 'NetCore Systems', pr: 'PR-2024-0094', amt: '₹ 6,20,000', status: 'Issued', match: 'Pending', del: '02 Feb 2024' },
  ]

  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      const matchesName = !nameFilter || 
        row.vendor.toLowerCase().includes(nameFilter.toLowerCase()) ||
        row.po.toLowerCase().includes(nameFilter.toLowerCase()) ||
        row.pr.toLowerCase().includes(nameFilter.toLowerCase())
      const matchesFrom = !dateFrom || row.dateSort >= dateFrom
      const matchesTo = !dateTo || row.dateSort <= dateTo
      return matchesName && matchesFrom && matchesTo
    })
  }, [nameFilter, dateFrom, dateTo])

  const hasActiveFilters = nameFilter || dateFrom || dateTo
  const clearFilters = () => { setNameFilter(''); setDateFrom(''); setDateTo('') }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Total POs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Total POs</p>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{totalPOs}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View all POs</p>
          </div>
        </div>

        {/* Open POs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Open POs</p>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{openPOs}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View open</p>
          </div>
        </div>

        {/* Pending GRN */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Pending GRN</p>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{pendingGRN}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View pending</p>
          </div>
        </div>

        {/* Mismatches */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Mismatches</p>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{mismatches}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View exceptions</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Pending Payments</p>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{pendingPayments}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View payments</p>
          </div>
        </div>

        {/* Payments This Month */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Payments This Month</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{paymentsThisMonth}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 cursor-pointer hover:underline">View payments</p>
          </div>
        </div>
        
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Purchase Orders (All)</h2>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-md">{filteredRows.length}</span>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <span className="text-lg leading-none">+</span> New PR
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, PO, PR..."
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">PO Number</th>
                <th className="px-6 py-4 font-semibold">PO Date</th>
                <th className="px-6 py-4 font-semibold">Vendor</th>
                <th className="px-6 py-4 font-semibold">PR Number</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">3-Way Match</th>
                <th className="px-6 py-4 font-semibold">Expected Delivery</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">No purchase orders match your filters.</td></tr>
              ) : filteredRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline">{row.po}</td>
                  <td className="px-6 py-4 text-slate-600">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.vendor}</td>
                  <td className="px-6 py-4 text-slate-600">{row.pr}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.amt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      row.status === 'Issued' ? 'bg-blue-50 text-blue-700' :
                      row.status === 'Partially Received' ? 'bg-amber-50 text-amber-700' :
                      row.status === 'Invoiced' ? 'bg-purple-50 text-purple-700' :
                      row.status === 'Closed' ? 'bg-slate-100 text-slate-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      row.match === 'Matched' ? 'bg-emerald-50 text-emerald-700' :
                      row.match === 'Mismatch' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {row.match}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.del}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
          <span>Showing {filteredRows.length} of {allRows.length} results</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50">3</button>
            <span className="w-8 h-8 flex items-center justify-center">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50">16</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">&gt;</button>
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* My Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">My Tasks</h3>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-md">7</span>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-start group cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Invoice <span className="text-blue-600">INV-2024-0112</span> awaiting 3-way match</p>
                <p className="text-xs text-slate-500 mt-1">PO-2024-0144</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="text-rose-600 font-medium">High</span>
                <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> 1h ago</span>
              </div>
            </div>
            <div className="flex justify-between items-start group cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">GRN for <span className="text-blue-600">PO-2024-0143</span> is pending</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="text-amber-600 font-medium">Medium</span>
              </div>
            </div>
            <div className="flex justify-between items-start group cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Dispute <span className="text-blue-600">DS-2024-0003</span> needs resolution</p>
                <p className="text-xs text-slate-500 mt-1">PO-2024-0139</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="text-rose-600 font-medium">High</span>
                <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> 1d ago</span>
              </div>
            </div>
            <div className="flex justify-between items-start group cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">Finance approval for <span className="text-blue-600">PO-2024-0141</span></p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="text-emerald-600 font-medium">Low</span>
              </div>
            </div>
          </div>
          <button className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all tasks &rarr;
          </button>
        </div>

        {/* 3-Way Match Exceptions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">3-Way Match Exceptions</h3>
              <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-md">4</span>
            </div>
            <span className="text-blue-600 text-sm font-semibold cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-4">
            {[
              { po: 'PO-2024-0144', pQty: 10, gQty: 8, iQty: 10, time: '1h ago' },
              { po: 'PO-2024-0139', pQty: 15, gQty: 12, iQty: 15, time: '1d ago' },
              { po: 'PO-2024-0132', pQty: 5, gQty: 5, iQty: 7, time: '2d ago' },
              { po: 'PO-2024-0128', pQty: 20, gQty: 18, iQty: 20, time: '3d ago' },
            ].map((exc, i) => (
              <div key={i} className="flex justify-between items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">{exc.po}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                    <span>PO: {exc.pQty}</span>
                    <span>GRN: {exc.gQty}</span>
                    <span>INV: {exc.iQty}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold border border-rose-100">Qty Mismatch</span>
                  <span className="text-slate-400 font-medium">{exc.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <span className="text-blue-600 text-sm font-semibold cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 before:z-0 pl-6">
            {[
              { msg: <><span className="text-slate-900 font-medium">Invoice INV-2024-0112</span> submitted by CloudSoft Services</>, time: '10 mins ago', color: 'bg-blue-500' },
              { msg: <><span className="text-blue-600 font-medium">PO-2024-0144</span> marked as Partially Received (8/10)</>, time: '1 hour ago', color: 'bg-amber-500' },
              { msg: <><span className="text-rose-600 font-medium">3-Way Match failed</span> for PO-2024-0144</>, time: '1 hour ago', color: 'bg-rose-500' },
              { msg: <><span className="text-emerald-600 font-medium">GRN-2024-0087</span> created for PO-2024-0143</>, time: '5 hours ago', color: 'bg-emerald-500' },
              { msg: <><span className="text-slate-900 font-medium">PO-2024-0145</span> issued to TechServe Solutions</>, time: '1 day ago', color: 'bg-blue-500' },
            ].map((act, i) => (
              <div key={i} className="relative z-10 flex items-start gap-4">
                <div className={`absolute -left-6 w-3 h-3 rounded-full mt-1 border-2 border-white shadow-sm ${act.color}`}></div>
                <div className="flex-1 -mt-0.5">
                  <p className="text-sm text-slate-600 leading-snug">{act.msg}</p>
                  <span className="text-xs text-slate-400 font-medium mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
