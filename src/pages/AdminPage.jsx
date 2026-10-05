import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  FileSpreadsheet,
  Flag,
  Phone,
  MapPin,
  Clock,
  Check,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react'

const DEMO_ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123'

export default function AdminPage() {
  const { t } = useTranslation()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [authError, setAuthError] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState('donors') // 'donors' | 'reports' | 'export'

  // Data states
  const [donors, setDonors] = useState([])
  const [reports, setReports] = useState([])
  const [contactCount, setContactCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Donors Filters
  const [donorSearch, setDonorSearch] = useState('')
  const [donorStatusFilter, setDonorStatusFilter] = useState('all')
  const [donorVerifFilter, setDonorVerifFilter] = useState('all')
  const [donorBloodFilter, setDonorBloodFilter] = useState('all')

  // Reports Filter
  const [reportStatusFilter, setReportStatusFilter] = useState('all')

  // Unmasked phone numbers set (admin privacy toggle)
  const [revealedPhones, setRevealedPhones] = useState(new Set())

  // Check persisted admin session on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('bloodaccess_admin_authenticated') === 'true'
    if (isAuth) {
      setIsAuthenticated(true)
    }
  }, [])

  // Load Admin Data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData()
    }
  }, [isAuthenticated])

  const handleLogin = (e) => {
    if (e) e.preventDefault()
    if (passcodeInput.trim() === DEMO_ADMIN_PASSCODE) {
      setIsAuthenticated(true)
      sessionStorage.setItem('bloodaccess_admin_authenticated', 'true')
      setAuthError('')
    } else {
      setAuthError('Incorrect passcode. Use the demo passcode "admin123" or check environment variables.')
    }
  }

  const handleQuickDemoLogin = () => {
    setPasscodeInput(DEMO_ADMIN_PASSCODE)
    setIsAuthenticated(true)
    sessionStorage.setItem('bloodaccess_admin_authenticated', 'true')
    setAuthError('')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('bloodaccess_admin_authenticated')
    setPasscodeInput('')
  }

  const fetchAdminData = async () => {
    setLoading(true)
    setRefreshing(true)
    setStatusMessage('')

    try {
      // 1. Fetch Donors
      let loadedDonors = []
      try {
        const { data, error } = await supabase
          .from('donors')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          loadedDonors = data
        }
      } catch (err) {
        console.warn('Supabase donors fetch notice:', err)
      }

      // Merge any local registered test donors from localStorage
      try {
        const localDonors = JSON.parse(localStorage.getItem('bloodaccess_local_donors') || '[]')
        const singleProfile = JSON.parse(localStorage.getItem('bloodaccess_donor_profile') || 'null')

        const mergedMap = new Map()
        loadedDonors.forEach(d => mergedMap.set(d.id, d))
        localDonors.forEach(d => {
          if (!mergedMap.has(d.id)) mergedMap.set(d.id, d)
        })
        if (singleProfile && singleProfile.id && !mergedMap.has(singleProfile.id)) {
          mergedMap.set(singleProfile.id, singleProfile)
        }
        loadedDonors = Array.from(mergedMap.values())
      } catch (storeErr) {
        console.warn('Local donors merge notice:', storeErr)
      }

      setDonors(loadedDonors)

      // 2. Fetch Reports
      let loadedReports = []
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          loadedReports = data
        }
      } catch (err) {
        console.warn('Supabase reports fetch notice:', err)
      }

      // Merge any local test reports
      try {
        const localReports = JSON.parse(localStorage.getItem('bloodaccess_local_reports') || '[]')
        const reportsMap = new Map()
        loadedReports.forEach(r => reportsMap.set(r.id, r))
        localReports.forEach(r => {
          if (!reportsMap.has(r.id)) reportsMap.set(r.id, r)
        })
        loadedReports = Array.from(reportsMap.values())
      } catch (storeErr) {
        console.warn('Local reports merge notice:', storeErr)
      }

      setReports(loadedReports)

      // 3. Fetch Contact Inquiries count
      try {
        const { count, error } = await supabase
          .from('contact_events')
          .select('*', { count: 'exact', head: true })
        if (!error && count !== null) {
          setContactCount(count)
        }
      } catch (cntErr) {
        console.warn('Contact events count notice:', cntErr)
      }
    } catch (generalErr) {
      console.error('Failed to load admin data:', generalErr)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Action: Verify or Unverify Donor
  const handleToggleVerify = async (donorId, currentLevel) => {
    const nextLevel = currentLevel >= 1 ? 0 : 1
    const donorName = donors.find(d => d.id === donorId)?.full_name || 'Donor'

    try {
      // 1. Try Supabase update or RPC
      let updated = false
      try {
        const { error } = await supabase
          .from('donors')
          .update({ verification_level: nextLevel })
          .eq('id', donorId)
        if (!error) updated = true
      } catch (e) {
        console.warn('Direct update failed, trying RPC...', e)
      }

      if (!updated) {
        try {
          await supabase.rpc('admin_verify_donor', {
            p_donor_id: donorId,
            p_level: nextLevel
          })
        } catch (rpcErr) {
          console.warn('RPC verify notice:', rpcErr)
        }
      }

      // Update state locally
      setDonors(prev =>
        prev.map(d => (d.id === donorId ? { ...d, verification_level: nextLevel } : d))
      )

      // Update localStorage if cached
      try {
        const localDonors = JSON.parse(localStorage.getItem('bloodaccess_local_donors') || '[]')
        const updatedLocals = localDonors.map(d =>
          d.id === donorId ? { ...d, verification_level: nextLevel } : d
        )
        localStorage.setItem('bloodaccess_local_donors', JSON.stringify(updatedLocals))
      } catch (e) {}

      setStatusMessage(
        nextLevel >= 1
          ? `Verified ${donorName} (Level 1 Verified Volunteer badge granted).`
          : `Revoked verification for ${donorName}.`
      )
    } catch (err) {
      console.error('Verification toggle failed:', err)
      setStatusMessage('Error updating verification status.')
    }
  }

  // Action: Suspend or Reactivate Donor
  const handleToggleSuspend = async (donorId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const donorName = donors.find(d => d.id === donorId)?.full_name || 'Donor'

    try {
      // 1. Try direct Supabase update
      let updated = false
      try {
        const { error } = await supabase
          .from('donors')
          .update({ status: nextStatus })
          .eq('id', donorId)
        if (!error) updated = true
      } catch (e) {
        console.warn('Direct suspend failed, trying RPC...', e)
      }

      if (!updated) {
        try {
          await supabase.rpc('admin_suspend_donor', {
            p_donor_id: donorId,
            p_status: nextStatus
          })
        } catch (rpcErr) {
          console.warn('RPC suspend notice:', rpcErr)
        }
      }

      // Update state locally
      setDonors(prev =>
        prev.map(d => (d.id === donorId ? { ...d, status: nextStatus } : d))
      )

      // Update local storage
      try {
        const localDonors = JSON.parse(localStorage.getItem('bloodaccess_local_donors') || '[]')
        const updatedLocals = localDonors.map(d =>
          d.id === donorId ? { ...d, status: nextStatus } : d
        )
        localStorage.setItem('bloodaccess_local_donors', JSON.stringify(updatedLocals))
      } catch (e) {}

      setStatusMessage(
        nextStatus === 'suspended'
          ? `Suspended donor account for ${donorName}. They are no longer visible in searches.`
          : `Re-activated donor account for ${donorName}.`
      )
    } catch (err) {
      console.error('Status toggle failed:', err)
      setStatusMessage('Error updating donor status.')
    }
  }

  // Action: Delete Donor
  const handleDeleteDonor = async (donorId) => {
    const donor = donors.find(d => d.id === donorId)
    const name = donor?.full_name || 'this donor'

    if (!window.confirm(`Are you sure you want to permanently delete donor ${name}? This action cannot be undone.`)) {
      return
    }

    try {
      try {
        await supabase.from('donors').delete().eq('id', donorId)
      } catch (delErr) {
        console.warn('Supabase delete error:', delErr)
      }

      setDonors(prev => prev.filter(d => d.id !== donorId))

      // Update local storage
      try {
        const localDonors = JSON.parse(localStorage.getItem('bloodaccess_local_donors') || '[]')
        const filteredLocals = localDonors.filter(d => d.id !== donorId)
        localStorage.setItem('bloodaccess_local_donors', JSON.stringify(filteredLocals))
      } catch (e) {}

      setStatusMessage(`Permanently deleted donor ${name}.`)
    } catch (err) {
      console.error('Delete donor failed:', err)
      setStatusMessage('Error deleting donor.')
    }
  }

  // Action: Moderate Report (Suspend Donor and mark Action Taken)
  const handleSuspendAndResolveReport = async (report) => {
    const donorId = report.reported_id
    const donor = donors.find(d => d.id === donorId)
    const donorName = donor?.full_name || report.donor_name || 'Reported Donor'

    try {
      // 1. Suspend donor
      await handleToggleSuspend(donorId, 'active')

      // 2. Update report status to action_taken
      try {
        await supabase
          .from('reports')
          .update({ status: 'action_taken' })
          .eq('id', report.id)
      } catch (repErr) {
        console.warn('Supabase report update notice:', repErr)
      }

      // Update reports locally
      setReports(prev =>
        prev.map(r => (r.id === report.id ? { ...r, status: 'action_taken' } : r))
      )

      // Update localStorage
      try {
        const localReports = JSON.parse(localStorage.getItem('bloodaccess_local_reports') || '[]')
        const updated = localReports.map(r =>
          r.id === report.id ? { ...r, status: 'action_taken' } : r
        )
        localStorage.setItem('bloodaccess_local_reports', JSON.stringify(updated))
      } catch (e) {}

      setStatusMessage(`Suspended ${donorName} and resolved report #${String(report.id).slice(0, 8)}.`)
    } catch (err) {
      console.error('Resolve report failed:', err)
      setStatusMessage('Error moderating report.')
    }
  }

  // Action: Dismiss Report
  const handleDismissReport = async (reportId) => {
    try {
      try {
        await supabase
          .from('reports')
          .update({ status: 'dismissed' })
          .eq('id', reportId)
      } catch (repErr) {
        console.warn('Supabase report dismiss notice:', repErr)
      }

      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
      )

      try {
        const localReports = JSON.parse(localStorage.getItem('bloodaccess_local_reports') || '[]')
        const updated = localReports.map(r =>
          r.id === reportId ? { ...r, status: 'dismissed' } : r
        )
        localStorage.setItem('bloodaccess_local_reports', JSON.stringify(updated))
      } catch (e) {}

      setStatusMessage(`Report #${String(reportId).slice(0, 8)} dismissed.`)
    } catch (err) {
      console.error('Dismiss report failed:', err)
      setStatusMessage('Error dismissing report.')
    }
  }

  // Toggle mask/unmask donor phone
  const togglePhoneMask = (id) => {
    setRevealedPhones(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // CSV Export: Donors
  const exportDonorsCSV = () => {
    if (donors.length === 0) {
      alert('No donor records to export.')
      return
    }

    const headers = [
      'ID',
      'Full Name',
      'Blood Group',
      'Age',
      'Gender',
      'Phone',
      'State',
      'City',
      'Area',
      'Contact Preference',
      'Available',
      'Verification Level',
      'Status',
      'Last Donated',
      'Created At'
    ]

    const rows = donors.map(d => [
      `"${d.id || ''}"`,
      `"${(d.full_name || '').replace(/"/g, '""')}"`,
      `"${d.blood_group || ''}"`,
      d.age || '',
      `"${d.gender || ''}"`,
      `"${d.phone || ''}"`,
      `"${(d.state || '').replace(/"/g, '""')}"`,
      `"${(d.city || '').replace(/"/g, '""')}"`,
      `"${(d.area || '').replace(/"/g, '""')}"`,
      `"${d.contact_pref || ''}"`,
      d.is_available ? 'YES' : 'NO',
      d.verification_level || 0,
      `"${d.status || 'active'}"`,
      `"${d.last_donated_on || ''}"`,
      `"${d.created_at || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `bloodaccess_donors_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // CSV Export: Reports
  const exportReportsCSV = () => {
    if (reports.length === 0) {
      alert('No reports records to export.')
      return
    }

    const headers = [
      'Report ID',
      'Type',
      'Reported ID',
      'Reason',
      'Reporter Phone',
      'Details',
      'Status',
      'Created At'
    ]

    const rows = reports.map(r => [
      `"${r.id || ''}"`,
      `"${r.reported_type || 'donor'}"`,
      `"${r.reported_id || ''}"`,
      `"${r.reason || ''}"`,
      `"${r.reporter_phone || ''}"`,
      `"${(r.details || '').replace(/"/g, '""')}"`,
      `"${r.status || 'open'}"`,
      `"${r.created_at || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `bloodaccess_reports_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered Donors List
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      // Search text
      if (donorSearch.trim()) {
        const q = donorSearch.toLowerCase().trim()
        const matchesName = (d.full_name || '').toLowerCase().includes(q)
        const matchesCity = (d.city || '').toLowerCase().includes(q)
        const matchesPhone = (d.phone || '').includes(q)
        const matchesBlood = (d.blood_group || '').toLowerCase().includes(q)
        if (!matchesName && !matchesCity && !matchesPhone && !matchesBlood) {
          return false
        }
      }

      // Status
      if (donorStatusFilter !== 'all') {
        if (donorStatusFilter === 'active' && d.status !== 'active') return false
        if (donorStatusFilter === 'suspended' && d.status !== 'suspended') return false
        if (donorStatusFilter === 'deleted' && d.status !== 'deleted') return false
      }

      // Verification
      if (donorVerifFilter !== 'all') {
        if (donorVerifFilter === 'verified' && (d.verification_level || 0) < 1) return false
        if (donorVerifFilter === 'unverified' && (d.verification_level || 0) >= 1) return false
      }

      // Blood group
      if (donorBloodFilter !== 'all' && d.blood_group !== donorBloodFilter) {
        return false
      }

      return true
    })
  }, [donors, donorSearch, donorStatusFilter, donorVerifFilter, donorBloodFilter])

  // Filtered Reports List
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (reportStatusFilter === 'all') return true
      return r.status === reportStatusFilter
    })
  }, [reports, reportStatusFilter])

  // Overview Metrics
  const stats = useMemo(() => {
    const total = donors.length
    const active = donors.filter(d => d.status === 'active').length
    const verified = donors.filter(d => (d.verification_level || 0) >= 1).length
    const suspended = donors.filter(d => d.status === 'suspended').length
    const openReports = reports.filter(r => r.status === 'open').length

    return { total, active, verified, suspended, openReports }
  }, [donors, reports])

  // Helper for formatting reason labels
  const formatReasonBadge = (reason) => {
    switch (reason) {
      case 'asked_for_money':
        return { label: 'Asked for Money (Illegal)', color: 'bg-red-100 text-red-800 border-red-200' }
      case 'fake':
        return { label: 'Fake / Wrong Contact', color: 'bg-amber-100 text-amber-800 border-amber-200' }
      case 'abusive':
        return { label: 'Abusive Conduct', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      default:
        return { label: 'Other Issue', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  // ---------------------------------------------------------------------------
  // 1. UNPROTECTED / LOGIN GATE VIEW
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-gray-50 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-red-50 text-[#D32F2F] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-[#222222] tracking-tight">
              {t('admin.loginTitle')}
            </h1>
            <p className="text-xs text-[#616161] leading-relaxed">
              {t('admin.loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
                Admin Passkey
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder={t('admin.passkeyPlaceholder')}
                className="w-full h-11 px-3 text-sm rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="tap-target w-full py-3 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{t('admin.unlockBtn')}</span>
            </button>

            {/* Quick Demo Access (kept active for testing) */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-xs text-[#D32F2F] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <span>{t('admin.quickLogin')} (Passkey: admin123)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-800">
              ← Return to Voluntary Platform Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-[#D32F2F]">
                Safety & Moderation
              </span>
              <span className="text-xs text-gray-400">SPEC Section 4.9</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#222222] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-[#D32F2F]" />
              <span>{t('admin.title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#616161]">
              {t('admin.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={refreshing}
              className="tap-target px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="tap-target px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-[#2E7D32] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage('')}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('admin.totalDonors')}
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-[#222222]">{stats.total}</p>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Donors
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-[#2E7D32]">{stats.active}</p>
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('admin.verifiedDonors')}
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-blue-600">{stats.verified}</p>
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('admin.suspendedDonors')}
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-red-600">{stats.suspended}</p>
              <UserX className="w-5 h-5 text-red-500" />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-2xs space-y-1 ${
            stats.openReports > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-gray-200'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {t('admin.openReports')}
            </span>
            <div className="flex items-baseline justify-between">
              <p className={`text-2xl font-black ${stats.openReports > 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                {stats.openReports}
              </p>
              <ShieldAlert className={`w-5 h-5 ${stats.openReports > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('donors')}
            className={`tap-target px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'donors'
                ? 'bg-[#222222] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('admin.tabDonors')}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
              {donors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`tap-target px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'reports'
                ? 'bg-[#D32F2F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t('admin.tabReports')}</span>
            {stats.openReports > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white text-[#D32F2F] font-black">
                {stats.openReports}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`tap-target px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'export'
                ? 'bg-[#222222] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('admin.tabExport')}</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DONORS MANAGEMENT TABLE */}
        {/* ============================================================== */}
        {activeTab === 'donors' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Filters Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder={t('admin.searchDonorsPlaceholder')}
                    className="w-full text-xs h-10 pl-9 pr-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={donorStatusFilter}
                    onChange={(e) => setDonorStatusFilter(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all bg-white"
                  >
                    <option value="all">Status: {t('admin.all')}</option>
                    <option value="active">{t('admin.active')}</option>
                    <option value="suspended">{t('admin.suspended')}</option>
                  </select>
                </div>

                {/* Verification Filter */}
                <div>
                  <select
                    value={donorVerifFilter}
                    onChange={(e) => setDonorVerifFilter(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all bg-white"
                  >
                    <option value="all">Verification: {t('admin.all')}</option>
                    <option value="verified">{t('admin.verified')}</option>
                    <option value="unverified">{t('admin.unverified')}</option>
                  </select>
                </div>

                {/* Blood Group Filter */}
                <div>
                  <select
                    value={donorBloodFilter}
                    onChange={(e) => setDonorBloodFilter(e.target.value)}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all bg-white"
                  >
                    <option value="all">Blood: {t('admin.all')}</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>
                  Showing <b>{filteredDonors.length}</b> of <b>{donors.length}</b> registered voluntary donors
                </span>
                <button
                  type="button"
                  onClick={exportDonorsCSV}
                  className="text-[#D32F2F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">{t('admin.colName')}</th>
                    <th className="py-3 px-3">{t('admin.colBlood')}</th>
                    <th className="py-3 px-4">{t('admin.colLocation')}</th>
                    <th className="py-3 px-4">{t('admin.colPhone')}</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">{t('admin.colVerification')}</th>
                    <th className="py-3 px-3">{t('admin.colStatus')}</th>
                    <th className="py-3 px-4 text-right">{t('admin.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredDonors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        No donors match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDonors.map((donor) => {
                      const isVerified = (donor.verification_level || 0) >= 1
                      const isSuspended = donor.status === 'suspended'
                      const isMasked = !revealedPhones.has(donor.id)

                      return (
                        <tr
                          key={donor.id}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            isSuspended ? 'bg-red-50/30 text-gray-500' : ''
                          }`}
                        >
                          {/* Name & Meta */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900 text-sm">
                              {donor.full_name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Age: {donor.age} ({donor.gender}) • ID: {String(donor.id).slice(0, 8)}...
                            </div>
                          </td>

                          {/* Blood Group */}
                          <td className="py-3.5 px-3">
                            <span className="inline-block px-2.5 py-1 rounded-lg font-black text-xs bg-[#FBEFEF] text-[#B71C1C] border border-red-100">
                              {donor.blood_group}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-gray-700">
                            <div>{donor.city}</div>
                            <div className="text-[10px] text-gray-400">{donor.area || donor.state}</div>
                          </td>

                          {/* Phone (with toggle for admin safety) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-gray-800">
                              <span>
                                {isMasked
                                  ? `${(donor.phone || '').slice(0, 4)}••••••`
                                  : donor.phone}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePhoneMask(donor.id)}
                                className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                                title={isMasked ? 'Reveal number' : 'Hide number'}
                              >
                                {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Availability */}
                          <td className="py-3.5 px-3">
                            {donor.is_available ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#2E7D32] border border-emerald-200 text-[10px] font-bold">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                Unavailable
                              </span>
                            )}
                          </td>

                          {/* Verification */}
                          <td className="py-3.5 px-3">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>Verified (L1)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px]">
                                Unverified (L0)
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase">
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions: Verify & Suspend & Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Verify / Revoke */}
                              <button
                                type="button"
                                onClick={() => handleToggleVerify(donor.id, donor.verification_level || 0)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                                  isVerified
                                    ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                                title={isVerified ? 'Revoke verification badge' : 'Grant Level 1 Verified badge'}
                              >
                                {isVerified ? t('admin.unverifyBtn') : t('admin.verifyBtn')}
                              </button>

                              {/* Suspend / Activate */}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(donor.id, donor.status)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                                  isSuspended
                                    ? 'bg-emerald-50 text-[#2E7D32] border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                }`}
                                title={isSuspended ? 'Reactivate donor' : 'Suspend donor from platform'}
                              >
                                {isSuspended ? t('admin.activateBtn') : t('admin.suspendBtn')}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDonor(donor.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete donor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MISUSE REPORTS QUEUE */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Filter and overview banner */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#D32F2F]" />
                  <span>Misuse Reports Queue ({filteredReports.length})</span>
                </h3>
                <p className="text-xs text-[#616161]">
                  Complaints filed by recipients or users. Donors with 3 reports are auto-suspended.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="text-xs h-9 px-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] bg-white outline-hidden font-semibold"
                >
                  <option value="all">All Reports</option>
                  <option value="open">Open / Pending</option>
                  <option value="action_taken">Action Taken</option>
                  <option value="dismissed">Dismissed</option>
                </select>

                <button
                  type="button"
                  onClick={exportReportsCSV}
                  className="tap-target px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[#222222]">{t('admin.noReports')}</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No misuse reports currently require moderation under the selected status filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.map((report) => {
                  const badgeInfo = formatReasonBadge(report.reason)
                  const reportedDonor = donors.find(d => d.id === report.reported_id)
                  const isOpen = report.status === 'open'

                  return (
                    <div
                      key={report.id}
                      className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 ${
                        isOpen ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Report Header: Reason Badge + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${badgeInfo.color}`}>
                            {badgeInfo.label}
                          </span>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                            report.status === 'open'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : report.status === 'action_taken'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>

                        {/* Reported Entity Info */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Reported Target</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#222222]">
                              {reportedDonor?.full_name || report.donor_name || 'Donor'}
                              {reportedDonor && ` (${reportedDonor.blood_group})`}
                            </span>
                            {reportedDonor && (
                              <span className="text-[11px] text-gray-500">
                                {reportedDonor.city}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            ID: {String(report.reported_id).slice(0, 12)}...
                          </div>
                        </div>

                        {/* Details Text */}
                        {report.details && (
                          <div className="text-xs text-gray-700 bg-red-50/30 p-3 rounded-xl border border-red-100 leading-relaxed">
                            <p className="font-semibold text-gray-800 text-[11px] mb-0.5">Report Details:</p>
                            <p className="italic">"{report.details}"</p>
                          </div>
                        )}

                        {/* Reporter Meta */}
                        <div className="text-[11px] text-gray-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                          <span>
                            Reporter: <b>{report.reporter_phone || 'Anonymous'}</b>
                          </span>
                          <span>
                            {new Date(report.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Moderation Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        {isOpen ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSuspendAndResolveReport(report)}
                              className="tap-target flex-1 py-2 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{t('admin.suspendAndAction')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDismissReport(report.id)}
                              className="tap-target px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {t('admin.dismissReport')}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Report moderated ({report.status})
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DATA EXPORT & AUDIT */}
        {/* ============================================================== */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#2E7D32]" />
                <span>Export & Compliance Reports (DPDP Act & Ethics)</span>
              </h3>
              <p className="text-xs text-[#616161] mt-1">
                Download verified administrative logs and audit snapshots for partner reporting and oversight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donors CSV Card */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Voluntary Donors Master</h4>
                    <p className="text-xs text-gray-500">Full roster including verification levels and status.</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Total records: <b>{donors.length}</b></p>
                  <p>• Verified volunteers: <b>{stats.verified}</b></p>
                  <p>• Active availability: <b>{stats.active}</b></p>
                </div>

                <button
                  type="button"
                  onClick={exportDonorsCSV}
                  className="tap-target w-full py-2.5 rounded-xl bg-[#222222] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('admin.exportCsv')}</span>
                </button>
              </div>

              {/* Reports CSV Card */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Misuse & Ethics Reports</h4>
                    <p className="text-xs text-gray-500">Incident reports and moderation audit records.</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Total reports logged: <b>{reports.length}</b></p>
                  <p>• Open for review: <b>{stats.openReports}</b></p>
                  <p>• Auto-suspend trigger: <b>3 verified complaints</b></p>
                </div>

                <button
                  type="button"
                  onClick={exportReportsCSV}
                  className="tap-target w-full py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('admin.exportReportsCsv')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
