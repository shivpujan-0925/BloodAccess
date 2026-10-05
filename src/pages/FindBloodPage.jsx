import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Phone,
  MessageCircle,
  PhoneCall,
  Flame,
  ArrowRight,
  Info,
  Calendar,
  Lock,
  Flag,
  Share2,
  Sparkles
} from 'lucide-react'
import supabase from '../lib/supabaseClient'

import ContactDonorModal from '../components/ContactDonorModal'
import ReportModal from '../components/ReportModal'

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const INDIAN_STATES_CITIES = {
  'ALL': ['ALL'],
  'Bihar': ['ALL', 'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Other'],
  'Delhi NCR': ['ALL', 'New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Other'],
  'Maharashtra': ['ALL', 'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Other'],
  'Karnataka': ['ALL', 'Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Other'],
  'Uttar Pradesh': ['ALL', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Bareilly', 'Other'],
  'West Bengal': ['ALL', 'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Other'],
  'Telangana': ['ALL', 'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Other'],
  'Tamil Nadu': ['ALL', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Other'],
  'Gujarat': ['ALL', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Other'],
  'Rajasthan': ['ALL', 'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer', 'Other'],
  'Jharkhand': ['ALL', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Other'],
  'Madhya Pradesh': ['ALL', 'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Other'],
  'Punjab': ['ALL', 'Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Other'],
  'Haryana': ['ALL', 'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Other'],
  'Kerala': ['ALL', 'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Other'],
  'Odisha': ['ALL', 'Bhubaneswar', 'Cuttack', 'Rourkela', 'Other'],
  'Other': ['ALL', 'Other City']
}

export default function FindBloodPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initial values from Home page quick search URL query params
  const paramGroup = searchParams.get('group') || 'ALL'
  const paramCity = searchParams.get('city') || 'ALL'
  const paramState = searchParams.get('state') || 'ALL'

  const [selectedGroup, setSelectedGroup] = useState(paramGroup)
  const [selectedState, setSelectedState] = useState(paramState)
  const [selectedCity, setSelectedCity] = useState(paramCity)
  const [areaQuery, setAreaQuery] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState('availableFirst')

  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [contactNoticeModal, setContactNoticeModal] = useState(null)
  const [reportNoticeModal, setReportNoticeModal] = useState(null)

  // Update state when URL query params change (e.g. from home page)
  useEffect(() => {
    if (searchParams.get('group')) {
      setSelectedGroup(searchParams.get('group'))
    }
    if (searchParams.get('city')) {
      setSelectedCity(searchParams.get('city'))
    }
    if (searchParams.get('state')) {
      setSelectedState(searchParams.get('state'))
    }
  }, [searchParams])

  // Fetch only from public_donors view
  useEffect(() => {
    let isCancelled = false

    async function fetchDonors() {
      setLoading(true)
      setErrorMsg('')

      try {
        let query = supabase.from('public_donors').select('*')

        // Filter by blood group
        if (selectedGroup && selectedGroup !== 'ALL') {
          query = query.eq('blood_group', selectedGroup)
        }

        // Filter by state
        if (selectedState && selectedState !== 'ALL') {
          query = query.eq('state', selectedState)
        }

        // Filter by city
        if (selectedCity && selectedCity !== 'ALL') {
          query = query.ilike('city', `%${selectedCity}%`)
        }

        // Filter by availability
        if (availableOnly) {
          query = query.eq('is_available', true)
        }

        // Default ranking from SPEC.md:
        // 1. Available now first
        // 2. Verified donors above unverified
        // 3. Longest time since last donation (oldest first, nulls first)
        query = query
          .order('is_available', { ascending: false })
          .order('verification_level', { ascending: false })
          .order('last_donated_on', { ascending: true, nullsFirst: true })

        const { data, error } = await query

        if (error) {
          console.error('Error fetching public_donors:', error)
          throw error
        }

        if (!isCancelled) {
          setDonors(data || [])
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Failed to fetch from public_donors view:', err.message)
          setErrorMsg(err.message || 'Could not load donors from public_donors view.')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchDonors()

    return () => {
      isCancelled = true
    }
  }, [selectedGroup, selectedState, selectedCity, availableOnly])

  // Filter client-side by optional Area search input and handle sort changes
  const filteredDonors = useMemo(() => {
    let result = [...donors]

    if (areaQuery.trim()) {
      const q = areaQuery.toLowerCase().trim()
      result = result.filter(d =>
        (d.area && d.area.toLowerCase().includes(q)) ||
        (d.city && d.city.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'oldestDonation') {
      result.sort((a, b) => {
        if (!a.last_donated_on) return -1
        if (!b.last_donated_on) return 1
        return new Date(a.last_donated_on) - new Date(b.last_donated_on)
      })
    }

    return result
  }, [donors, areaQuery, sortBy])

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedGroup('ALL')
    setSelectedState('ALL')
    setSelectedCity('ALL')
    setAreaQuery('')
    setAvailableOnly(false)
    setSortBy('availableFirst')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF] rounded-full mb-2">
                Voluntary Search Network
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                {t('find.title')}
              </h1>
              <p className="mt-1 text-sm text-[#616161]">
                {t('find.subtitle')}
              </p>
            </div>

            {/* Quick SOS Trigger */}
            <Link
              to="/sos"
              className="tap-target px-4 py-2.5 rounded-xl bg-red-50 text-[#B71C1C] border border-red-200 hover:bg-red-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
            >
              <Flame className="w-4 h-4 text-[#D32F2F]" />
              <span>{t('find.sosBtn')}</span>
            </Link>
          </div>

          {/* Privacy Banner */}
          <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 text-xs text-[#616161] flex items-center gap-2 shadow-2xs">
            <Lock className="w-4 h-4 text-[#D32F2F] shrink-0" />
            <span>{t('find.privacyNotice')}</span>
          </div>
        </div>

        {/* Main Grid: Filters on Left (or Top on Mobile) + Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============================================================== */}
          {/* FILTERS SIDEBAR */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-[#222222] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#D32F2F]" />
                <span>{t('find.filters')}</span>
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#D32F2F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('find.resetFilters')}</span>
              </button>
            </div>

            {/* Blood Group Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-2.5">
                {t('hero.selectBloodGroup')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {BLOOD_GROUPS.map((group) => {
                  const isSelected = selectedGroup === group
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedGroup(group)}
                      className={`tap-target h-11 rounded-xl font-bold text-sm transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#D32F2F] text-white shadow-xs ring-2 ring-[#B71C1C] ring-offset-1'
                          : 'bg-gray-50 text-[#222222] hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {group === 'ALL' ? t('find.allBloodGroups') : group}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* State Filter */}
            <div>
              <label htmlFor="state-filter" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
                {t('register.state')}
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  setSelectedCity('ALL')
                }}
                className="tap-target w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-[#222222] focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] cursor-pointer"
              >
                <option value="ALL">{t('find.allStates')}</option>
                {Object.keys(INDIAN_STATES_CITIES).filter(s => s !== 'ALL').map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label htmlFor="city-filter" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
                {t('register.city')}
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="tap-target w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-[#222222] focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] cursor-pointer"
              >
                <option value="ALL">{t('find.allCities')}</option>
                {(INDIAN_STATES_CITIES[selectedState] || INDIAN_STATES_CITIES['Bihar']).filter(c => c !== 'ALL').map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Area search */}
            <div>
              <label htmlFor="area-filter" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
                {t('find.searchByArea')}
              </label>
              <div className="relative">
                <input
                  id="area-filter"
                  type="text"
                  placeholder={t('find.areaPlaceholder')}
                  value={areaQuery}
                  onChange={(e) => setAreaQuery(e.target.value)}
                  className="tap-target w-full h-11 pl-9 pr-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D32F2F]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* "Available Now" Toggle Switch */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-sm font-bold text-[#222222]">
                  {t('find.availableNowOnly')}
                </span>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32] relative"></div>
              </label>
            </div>

            {/* Sort Dropdown */}
            <div className="pt-2 border-t border-gray-100">
              <label htmlFor="sort-select" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
                {t('find.sortBy')}
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="tap-target w-full h-11 px-3.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-[#222222] focus:ring-2 focus:ring-[#D32F2F] cursor-pointer"
              >
                <option value="availableFirst">{t('find.sortAvailableFirst')}</option>
                <option value="oldestDonation">{t('find.sortOldestDonation')}</option>
              </select>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DONOR RESULTS SECTION */}
          {/* ============================================================== */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header info count */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-bold text-[#222222]">
                <span className="text-[#D32F2F] text-base">{filteredDonors.length}</span>{' '}
                {t('find.donorsFound')}
              </p>
              {selectedGroup !== 'ALL' && (
                <span className="px-2.5 py-1 rounded-md bg-[#FBEFEF] text-[#B71C1C] text-xs font-bold">
                  Group: {selectedGroup}
                </span>
              )}
            </div>

            {/* ============================================================== */}
            {/* LOADING SKELETON */}
            {/* ============================================================== */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                      <div className="h-8 w-12 bg-red-100 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {!loading && errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Database Notice</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* EMPTY STATE */}
            {/* ============================================================== */}
            {!loading && filteredDonors.length === 0 && (
              <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs space-y-4">
                <div className="w-16 h-16 bg-red-50 text-[#D32F2F] rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#222222]">
                  {t('find.emptyTitle')}
                </h3>
                <p className="text-sm text-[#616161] max-w-md mx-auto leading-relaxed">
                  {t('find.emptySubtitle')}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="tap-target px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-[#222222] hover:bg-gray-50 cursor-pointer"
                  >
                    {t('find.resetFilters')}
                  </button>
                  <Link
                    to="/sos"
                    className="tap-target px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{t('find.sosBtn')}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* DONOR CARDS LIST */}
            {/* ============================================================== */}
            {!loading && filteredDonors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDonors.map((donor) => {
                  const isAvailable = Boolean(donor.is_available)
                  const isVerified = (donor.verification_level || 0) >= 1

                  return (
                    <div
                      key={donor.id}
                      className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/90 hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Name, Verified Badge, Blood Group Pill */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-lg font-bold text-[#222222] tracking-tight">
                                {donor.display_name}
                              </h3>
                              {isVerified && (
                                <span title="Verified Volunteer Donor">
                                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            <p className="text-xs text-[#616161] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                              <span>{donor.city}{donor.area ? `, ${donor.area}` : ''}</span>
                            </p>
                          </div>

                          {/* Blood Group Badge */}
                          <div className="w-12 h-12 rounded-xl bg-[#FBEFEF] text-[#B71C1C] border border-red-100 font-extrabold text-lg flex items-center justify-center shadow-2xs shrink-0">
                            {donor.blood_group}
                          </div>
                        </div>

                        {/* Status Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold">
                          {/* Availability Badge */}
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-[#2E7D32] border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('find.available')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                {donor.next_eligible_on
                                  ? `${t('find.availableFrom')} ${new Date(donor.next_eligible_on).toLocaleDateString()}`
                                  : 'Temporarily Resting'}
                              </span>
                            </span>
                          )}

                          {/* Contact Pref Indicator */}
                          {donor.contact_pref && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px]">
                              {donor.contact_pref === 'whatsapp' ? (
                                <>
                                  <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                  <span>{t('find.whatsappPref')}</span>
                                </>
                              ) : donor.contact_pref === 'call' ? (
                                <>
                                  <Phone className="w-3 h-3 text-[#D32F2F]" />
                                  <span>{t('find.callPref')}</span>
                                </>
                              ) : (
                                <>
                                  <PhoneCall className="w-3 h-3 text-[#2E7D32]" />
                                  <span>{t('find.bothPref')}</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Last Donated Meta */}
                        <div className="text-xs text-[#616161] pb-4 mb-4 border-b border-gray-100 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {donor.last_donated_formatted
                              ? `${t('find.lastDonated')}: ${donor.last_donated_formatted}`
                              : t('find.firstTime')}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Button & Report */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setContactNoticeModal(donor)}
                          className="tap-target flex-grow h-11 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{t('find.contactDonor')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportNoticeModal(donor)}
                          className="tap-target w-11 h-11 rounded-xl border border-gray-200 text-gray-500 hover:text-[#D32F2F] hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                          title={t('find.report')}
                          aria-label={`Report donor ${donor.display_name}`}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CONTACT DONOR MODAL WITH OTP VERIFICATION & REVEAL */}
      {/* ============================================================== */}
      {contactNoticeModal && (
        <ContactDonorModal
          donor={contactNoticeModal}
          onClose={() => setContactNoticeModal(null)}
        />
      )}

      {/* ============================================================== */}
      {/* REPORT MISUSE MODAL */}
      {/* ============================================================== */}
      {reportNoticeModal && (
        <ReportModal
          donor={reportNoticeModal}
          onClose={() => setReportNoticeModal(null)}
        />
      )}
    </div>
  )
}
