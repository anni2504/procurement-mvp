import { useState, useEffect } from 'react'
import { fetchVendors, VendorRecord, VendorListResponse } from '../api'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from '../context/ToastContext'
import { Filter, UserPlus, X } from 'lucide-react'

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<VendorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [showRegister, setShowRegister] = useState(false)
  
  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priceTier, setPriceTier] = useState('')
  const [minRating, setMinRating] = useState('')

  const { showToast } = useToast()

  // Handle debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search)
        setPage(1) // Reset to page 1 ONLY when search actually changes
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search, debouncedSearch])

  // Fetch vendors
  useEffect(() => {
    let isMounted = true

    const loadVendors = async () => {
      setLoading(true)
      try {
        const filters: any = { page, limit: 10 }
        if (debouncedSearch) filters.search = debouncedSearch
        if (category) filters.category = category
        if (priceTier) filters.price_tier = priceTier
        if (minRating) filters.min_rating = Number(minRating)

        const data: VendorListResponse = await fetchVendors(filters)
        
        if (isMounted) {
          setVendors(data.vendors)
          setTotalPages(data.pagination.totalPages)
          setTotalRecords(data.pagination.total)
        }
      } catch (err) {
        if (isMounted) {
          showToast('Failed to load vendors', 'error')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadVendors()

    return () => {
      isMounted = false
    }
  }, [page, debouncedSearch, category, priceTier, minRating, showToast])

  // Reset page when dropdown filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value)
    setPage(1)
  }

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-amber-400">★</span>
        <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row justify-between md:items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Vendor Directory</h2>
          <p className="text-slate-500 mt-1">Manage and view all registered vendors.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-56 relative">
            <Input 
              placeholder="Search vendors..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={category} 
              onChange={e => handleFilterChange(setCategory, e.target.value)}
              className="h-8 bg-transparent text-sm font-medium text-slate-700 focus:outline-none pl-1 pr-2 cursor-pointer border-r border-slate-100"
            >
              <option value="">All Categories</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Furniture">Furniture</option>
              <option value="Software">Software</option>
              <option value="Services">Services</option>
            </select>
            <select 
              value={priceTier} 
              onChange={e => handleFilterChange(setPriceTier, e.target.value)}
              className="h-8 bg-transparent text-sm font-medium text-slate-700 focus:outline-none pl-2 pr-2 cursor-pointer border-r border-slate-100"
            >
              <option value="">All Tiers</option>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-Range</option>
              <option value="premium">Premium</option>
            </select>
            <select 
              value={minRating} 
              onChange={e => handleFilterChange(setMinRating, e.target.value)}
              className="h-8 bg-transparent text-sm font-medium text-slate-700 focus:outline-none pl-2 pr-2 cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <Button onClick={() => setShowRegister(true)} className="h-10 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 whitespace-nowrap">
            <UserPlus className="w-4 h-4" /> Become a Vendor
          </Button>
        </div>
      </div>

      {/* Become a Vendor Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowRegister(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Register as a Vendor</h2>
            <p className="text-sm text-slate-500 mb-6">Fill in your details to join the vendor network.</p>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowRegister(false); showToast('Vendor registration submitted!', 'success') }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Company Name</label>
                  <input required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Email</label>
                  <input required type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="vendor@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
                  <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="">Select...</option>
                    <option>IT Equipment</option>
                    <option>Office Supplies</option>
                    <option>Furniture</option>
                    <option>Software</option>
                    <option>Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Location</label>
                  <input required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Mumbai, India" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Phone</label>
                <input required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="+91 98765 43210" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5">Submit Registration</Button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Price Tier</th>
                <th className="px-6 py-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2">Loading vendors...</p>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              ) : (
                vendors.map(vendor => (
                  <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{vendor.name}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-slate-50">{vendor.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {renderRating(vendor.rating)}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600">
                      {vendor.priceTier}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vendor.location}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-800">{vendors.length}</span> of <span className="font-semibold text-slate-800">{totalRecords}</span> vendors
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-9 px-4 text-sm font-medium"
            >
              Previous
            </Button>
            <div className="flex items-center px-4 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md">
              Page {page} of {totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
              className="h-9 px-4 text-sm font-medium"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
