import { useState, useEffect } from 'react'
import { ProcurementProvider, useProcurement, TOTAL_STEPS, getStepStatuses } from './context/ProcurementContext'
import { ToastProvider } from './context/ToastContext'
import Dashboard from './components/Dashboard'
import Step1Request from './components/Step1Request'
import Step2Approval from './components/Step2Approval'
import VendorQuotes from './components/VendorQuotes'
import Step4PO from './components/Step4PO'
import Step5GRN from './components/Step5GRN'
import Step6Invoice from './components/Step6Invoice'
import Step7Match from './components/Step7Match'
import Step8Dispute from './components/Step8Dispute'
import Step9Finance from './components/Step9Finance'
import Step10Payment from './components/Step10Payment'
import RequestQueue from './components/RequestQueue'
import VendorDirectory from './components/VendorDirectory'
import { Badge } from './components/ui/badge'
import {
  LayoutDashboard, ClipboardList, CheckCircle, FileText, ShoppingCart, MessageSquareQuote,
  Package, Receipt, GitCompare, AlertTriangle, CreditCard, Banknote, Users, Settings, Bell, Search
} from 'lucide-react'

// Map the 10 steps from PRD
const STEPS = [
  { id: 1, title: 'PR Requests', icon: ClipboardList, comp: Step1Request },
  { id: 2, title: 'Approvals', icon: CheckCircle, comp: Step2Approval },
  { id: 3, title: 'RFP & Vendors', icon: MessageSquareQuote, comp: VendorQuotes },
  { id: 4, title: 'PO Purchase Orders', icon: ShoppingCart, comp: Step4PO },
  { id: 5, title: 'GRN Goods Receipt', icon: Package, comp: Step5GRN },
  { id: 6, title: 'INV Invoices', icon: Receipt, comp: Step6Invoice },
  { id: 7, title: 'MATCH 3-Way Match', icon: GitCompare, comp: Step7Match },
  { id: 8, title: 'DISPUTE Disputes', icon: AlertTriangle, comp: Step8Dispute },
  { id: 9, title: 'FIN Finance', icon: CreditCard, comp: Step9Finance },
  { id: 10, title: 'PAY Payments', icon: Banknote, comp: Step10Payment },
]

function StepContent({ stepId }: { stepId: number }) {
  const { state, createNewWorkflow, currentUser } = useProcurement()
  const step = STEPS.find(s => s.id === stepId)!
  const Component = step.comp

  // Determine step status for the header badge based on active workflow
  const statuses = getStepStatuses(state.activeWorkflow)
  const stepStatus = statuses[stepId]

  const handleCreateNew = async () => {
    try {
      await createNewWorkflow()
    } catch (err) {
      console.error(err)
    }
  }

  // Enforce roles per step
  const STEP_ROLES: Record<number, { roles: string[]; name: string }> = {
    1: { roles: ['requester'], name: 'Requester (Alice)' },
    2: { roles: ['manager'], name: 'Manager (Bob)' },
    3: { roles: ['procurement'], name: 'Procurement (Charlie)' },
    4: { roles: ['procurement'], name: 'Procurement (Charlie)' },
    5: { roles: ['warehouse'], name: 'Warehouse (Dave)' },
    6: { roles: ['vendor'], name: 'Vendor (Victor)' },
    7: { roles: ['procurement', 'finance'], name: 'Procurement (Charlie) or Finance (Frank)' },
    8: { roles: ['procurement', 'warehouse', 'vendor'], name: 'Procurement (Charlie), Warehouse (Dave), or Vendor (Victor)' },
    9: { roles: ['finance'], name: 'Finance (Frank)' },
    10: { roles: ['finance'], name: 'Finance (Frank)' },
  }

  const stepConfig = STEP_ROLES[stepId]
  const isAuthorized = currentUser && (currentUser.role === 'admin' || stepConfig.roles.includes(currentUser.role))

  return (
    <div className="animate-slide-in-right" key={stepId}>
      <RequestQueue stepId={stepId} onCreateNew={stepId === 1 ? handleCreateNew : undefined} />
      
      {state.activeWorkflow && (
        <>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stepStatus === 'completed' ? 'bg-emerald-100' :
                stepStatus === 'in_progress' ? 'bg-indigo-100' : 'bg-slate-100'
              }`}>
                <step.icon className={`w-5 h-5 ${
                  stepStatus === 'completed' ? 'text-emerald-600' :
                  stepStatus === 'in_progress' ? 'text-indigo-600' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Step {stepId} of {TOTAL_STEPS}</p>
                <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
              </div>
            </div>
            {stepStatus === 'completed' && <Badge variant="success" className="rounded-full px-3">✓ Completed</Badge>}
            {stepStatus === 'in_progress' && <Badge className="rounded-full px-3 bg-indigo-100 text-indigo-700 border-indigo-200">● Active</Badge>}
            {stepStatus === 'pending' && <Badge variant="secondary" className="rounded-full px-3">○ Pending</Badge>}
          </div>

          {!isAuthorized && stepStatus === 'in_progress' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm animate-fade-in">
              <span className="text-lg leading-none">⚠️</span>
              <div>
                <p className="font-bold text-amber-900">Role Restriction Active</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You are logged in as <strong className="capitalize">{currentUser?.name} ({currentUser?.role})</strong>. 
                  Only <strong className="underline">{stepConfig.name}</strong> or an <strong>Admin</strong> can execute this step. 
                  Use the <strong>Actor Switcher</strong> in the header to switch roles and complete this step.
                </p>
              </div>
            </div>
          )}

          <div className={`animate-fade-in transition-all ${!isAuthorized && stepStatus === 'in_progress' ? 'opacity-60 pointer-events-none select-none' : ''}`}>
            {Component && <Component />}
          </div>
        </>
      )}
    </div>
  )
}

function Layout() {
  const { state } = useProcurement()
  const [selected, setSelected] = useState<string | number>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        
        {/* Global Sidebar - Dark Theme with slide transition */}
        <aside 
          className="bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{ width: sidebarOpen ? '16rem' : '0', minWidth: sidebarOpen ? '16rem' : '0' }}
        >
          <div className="p-4 space-y-1 w-64">
            <button 
              onClick={() => setSelected('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 font-medium text-[13px] ${
                selected === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${selected === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
              Dashboard
            </button>
            
            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Procurement Cycle</p>
            </div>
            
            {STEPS.map((step) => {
              const isSelected = step.id === selected
              const Icon = step.icon
              return (
                <button key={step.id} onClick={() => setSelected(step.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                    isSelected ? 'bg-blue-600 text-white shadow-md font-semibold' : 'text-slate-300 font-medium hover:bg-slate-800 hover:text-white'
                  }`}>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="truncate max-w-[120px]">{step.title}</span>
                  </div>
                </button>
              )
            })}

            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Management</p>
            </div>

            <button 
              onClick={() => setSelected('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 font-medium text-[13px] ${
                selected === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className={`w-4 h-4 ${selected === 'reports' ? 'text-white' : 'text-slate-400'}`} />
              Reports
            </button>
            
            <button 
              onClick={() => setSelected('vendors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 font-medium text-[13px] ${
                selected === 'vendors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className={`w-4 h-4 ${selected === 'vendors' ? 'text-white' : 'text-slate-400'}`} />
              Vendors
            </button>

            <button 
              onClick={() => setSelected('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 font-medium text-[13px] ${
                selected === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 ${selected === 'settings' ? 'text-white' : 'text-slate-400'}`} />
              Settings
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto px-8 py-8 w-full">
            {selected === 'dashboard' && <Dashboard />}
            {selected === 'vendors' && <VendorDirectory />}
            {selected === 'reports' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Vendor Sales Report</h2>
                  <p className="text-slate-500 mt-1">Total sales by vendor across all purchase orders.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Vendor</th>
                        <th className="px-6 py-4">Total POs</th>
                        <th className="px-6 py-4">Total Sales</th>
                        <th className="px-6 py-4">Avg Order Value</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { vendor: 'TechServe Solutions', pos: 12, sales: '₹ 28,40,000', avg: '₹ 2,36,667', status: 'Active' },
                        { vendor: 'CloudSoft Services', pos: 9, sales: '₹ 22,50,000', avg: '₹ 2,50,000', status: 'Active' },
                        { vendor: 'NetCore Systems', pos: 7, sales: '₹ 18,60,000', avg: '₹ 2,65,714', status: 'Active' },
                        { vendor: 'Global Infotech', pos: 8, sales: '₹ 15,40,000', avg: '₹ 1,92,500', status: 'Active' },
                        { vendor: 'Delta Electronics', pos: 6, sales: '₹ 11,70,000', avg: '₹ 1,95,000', status: 'Active' },
                        { vendor: 'Office Needs Ltd.', pos: 14, sales: '₹ 8,40,000', avg: '₹ 60,000', status: 'Active' },
                        { vendor: 'Prime Furnitures', pos: 5, sales: '₹ 6,30,000', avg: '₹ 1,26,000', status: 'Inactive' },
                        { vendor: 'Stationery World', pos: 18, sales: '₹ 3,33,000', avg: '₹ 18,500', status: 'Active' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{row.vendor}</td>
                          <td className="px-6 py-4 text-slate-600">{row.pos}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{row.sales}</td>
                          <td className="px-6 py-4 text-slate-600">{row.avg}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {selected === 'settings' && (
              <div className="animate-fade-in space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">System Settings</h2>
                  <p className="text-slate-500 mt-1">Configure your preferences.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Dark Mode</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Toggle dark mode for the application interface.</p>
                    </div>
                    <button
                      onClick={() => { document.documentElement.classList.toggle('dark'); }}
                      className="relative w-12 h-6 rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 peer-checked:bg-blue-600 group"
                    >
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform group-[.active]:translate-x-6"></span>
                    </button>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Email Notifications</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Receive email alerts for PO approvals and disputes.</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Enabled</span>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Currency</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Default currency for all transactions.</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">₹ INR</span>
                  </div>
                </div>
              </div>
            )}
            {typeof selected === 'number' && <StepContent stepId={selected} />}
          </div>
        </main>
      </div>
    </div>
  )
}

function Header({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const { currentUser, logout, login } = useProcurement()

  const ROLE_EMAILS: Record<string, string> = {
    requester: 'alice@company.com',
    manager: 'bob@company.com',
    procurement: 'charlie@company.com',
    warehouse: 'dave@company.com',
    vendor: 'victor@company.com',
    finance: 'frank@company.com',
    admin: 'admin@company.com',
  }

  const handleRoleChange = async (newRole: string) => {
    const email = ROLE_EMAILS[newRole]
    if (email) {
      try {
        await login(email, 'password123')
      } catch (err) {
        console.error('Role switch failed:', err)
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'requester': return 'bg-violet-50 text-violet-800 border-violet-200'
      case 'manager': return 'bg-sky-50 text-sky-800 border-sky-200'
      case 'procurement': return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'warehouse': return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'vendor': return 'bg-indigo-50 text-indigo-800 border-indigo-200'
      case 'finance': return 'bg-rose-50 text-rose-800 border-rose-200'
      default: return 'bg-slate-50 text-slate-800 border-slate-200'
    }
  }

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'requester': return 'bg-violet-600'
      case 'manager': return 'bg-sky-600'
      case 'procurement': return 'bg-amber-600'
      case 'warehouse': return 'bg-emerald-600'
      case 'vendor': return 'bg-indigo-600'
      case 'finance': return 'bg-rose-600'
      default: return 'bg-slate-700'
    }
  }

  return (
    <header className={`px-6 py-3 flex items-center justify-between z-30 transition-all duration-300 ease-in-out ${
      sidebarOpen 
        ? 'bg-white border-b border-slate-200' 
        : 'bg-slate-900 border-b border-slate-800'
    }`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className={`p-1 transition-colors duration-300 ${
            sidebarOpen ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 hover:text-white'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 className={`font-bold text-[15px] tracking-tight flex items-center gap-2 transition-colors duration-300 ${
          sidebarOpen ? 'text-slate-900' : 'text-white'
        }`}>
          Accounts Payable
        </h1>
      </div>
      
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
            sidebarOpen ? 'text-slate-400' : 'text-slate-400'
          }`} />
          <input 
            type="text" 
            placeholder="Search PO, PR, Vendor, Invoice..." 
            className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
              sidebarOpen 
                ? 'bg-slate-50 border border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900' 
                : 'bg-slate-800 border border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-white'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-5 relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-1 transition-colors duration-300 ${
            showNotifications 
              ? 'text-blue-400' 
              : sidebarOpen ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>

        {showNotifications && (
          <div className="absolute top-full mt-3 right-32 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all as read</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm text-slate-800"><span className="font-semibold text-blue-600">INV-2024-0112</span> needs 3-way matching</p>
                <p className="text-xs text-slate-400 mt-1">10 mins ago</p>
              </div>
              <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm text-slate-800">New vendor quote received for <span className="font-semibold text-slate-900">PR-2024-0102</span></p>
                <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
              </div>
              <div className="p-4 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm text-slate-800"><span className="font-semibold text-rose-600">Dispute opened</span> for mismatch on PO-2024-0144</p>
                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
              <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">View all notifications</span>
            </div>
          </div>
        )}

        {/* Switch Actor Selector */}
        <div className="flex items-center gap-2">
          <label className={`text-xs font-bold uppercase tracking-wider ${
            sidebarOpen ? 'text-slate-500' : 'text-slate-400'
          }`}>Actor:</label>
          <select
            value={currentUser?.role || ''}
            onChange={(e) => handleRoleChange(e.target.value)}
            className={`text-xs font-semibold py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all border ${
              sidebarOpen 
                ? 'bg-slate-50 border-slate-200 text-slate-700' 
                : 'bg-slate-800 border-slate-700 text-white'
            }`}
          >
            <option value="requester">Alice (Requester)</option>
            <option value="manager">Bob (Manager)</option>
            <option value="procurement">Charlie (Procurement)</option>
            <option value="warehouse">Dave (Warehouse)</option>
            <option value="vendor">Victor (Vendor)</option>
            <option value="finance">Frank (Finance)</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
        
        <div className={`flex items-center gap-3 pl-5 transition-colors duration-300 ${
          sidebarOpen ? 'border-l border-slate-200' : 'border-l border-slate-700'
        }`}>
          <div className={`w-8 h-8 rounded-full ${getAvatarColor(currentUser?.role || 'admin')} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className={`text-[13px] font-bold leading-tight transition-colors duration-300 ${
              sidebarOpen ? 'text-slate-900' : 'text-white'
            }`}>{currentUser?.name || 'User'}</p>
            <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 uppercase tracking-wider transition-colors duration-300 ${getRoleBadgeColor(currentUser?.role || '')}`}>
              {currentUser?.role || 'None'}
            </p>
          </div>
          
          <button
            onClick={logout}
            title="Log Out"
            className={`p-1.5 rounded-lg border transition-all ${
              sidebarOpen 
                ? 'border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200' 
                : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function LoginScreen() {
  const { login } = useProcurement()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null)
    setLoading(true)
    try {
      await login(demoEmail, 'password123')
    } catch (err) {
      setError((err as Error).message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { name: 'Alice', role: 'requester', desc: 'Raise Requests (Step 1)', email: 'alice@company.com', color: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100' },
    { name: 'Bob', role: 'manager', desc: 'Approve Requests (Step 2)', email: 'bob@company.com', color: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100' },
    { name: 'Charlie', role: 'procurement', desc: 'RFP & Purchase Orders (Steps 3-4)', email: 'charlie@company.com', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
    { name: 'Dave', role: 'warehouse', desc: 'Goods Receipts (Step 5)', email: 'dave@company.com', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
    { name: 'Victor', role: 'vendor', desc: 'Submit Invoices (Step 6)', email: 'victor@company.com', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
    { name: 'Frank', role: 'finance', desc: 'Pay & Settle (Steps 9-10)', email: 'frank@company.com', color: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' },
    { name: 'Admin', role: 'admin', desc: 'Full System Access', email: 'admin@company.com', color: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100' },
  ]

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="flex-1 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🛡️</span> Procurement MVP
            </h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to manage the accounts payable pipeline.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-white placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold text-sm transition-colors mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Right Side: Demo Accounts */}
        <div className="flex-1 p-8 bg-slate-950/40">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Interactive Demo Accounts</h3>
            <p className="text-slate-400 text-xs mt-0.5">Click any actor card to log in instantly and test their workflow permissions.</p>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${acc.color}`}
              >
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider">{acc.name} ({acc.role})</p>
                  <p className="text-[11px] opacity-80 mt-0.5">{acc.desc}</p>
                </div>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Quick Login →</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function AppContent() {
  const { currentUser, authLoading } = useProcurement()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Procurement System...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginScreen />
  }

  return <Layout />
}

export default function App() {
  return (
    <ProcurementProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ProcurementProvider>
  )
}
