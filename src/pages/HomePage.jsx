import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  UserPlus,
  ShieldCheck,
  Lock,
  HeartHandshake,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Users,
  Building2,
  Activity,
  ArrowRight,
  PhoneCall,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const MAJOR_CITIES = [
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'bengaluru', name: 'Bengaluru' },
  { id: 'hyderabad', name: 'Hyderabad' },
  { id: 'patna', name: 'Patna' },
  { id: 'lucknow', name: 'Lucknow' },
  { id: 'kolkata', name: 'Kolkata' },
  { id: 'pune', name: 'Pune' },
  { id: 'ahmedabad', name: 'Ahmedabad' },
  { id: 'jaipur', name: 'Jaipur' },
  { id: 'ranchi', name: 'Ranchi' },
  { id: 'bhopal', name: 'Bhopal' },
  { id: 'chandigarh', name: 'Chandigarh' },
  { id: 'varanasi', name: 'Varanasi' },
]

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [selectedGroup, setSelectedGroup] = useState('O+')
  const [selectedCity, setSelectedCity] = useState('')
  const [activeFaqTab, setActiveFaqTab] = useState('donors')
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (selectedGroup) query.set('group', selectedGroup)
    if (selectedCity) query.set('city', selectedCity)
    navigate(`/find?${query.toString()}`)
  }

  const donorFaqs = [
    { q: t('faq.donorQ1'), a: t('faq.donorA1') },
    { q: t('faq.donorQ2'), a: t('faq.donorA2') },
    { q: t('faq.donorQ3'), a: t('faq.donorA3') },
    { q: t('faq.donorQ4'), a: t('faq.donorA4') },
  ]

  const requesterFaqs = [
    { q: t('faq.reqQ1'), a: t('faq.reqA1') },
    { q: t('faq.reqQ2'), a: t('faq.reqA2') },
    { q: t('faq.reqQ3'), a: t('faq.reqA3') },
    { q: t('faq.reqQ4'), a: t('faq.reqA4') },
  ]

  const currentFaqs = activeFaqTab === 'donors' ? donorFaqs : requesterFaqs

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. HERO SECTION (Deep red background #B71C1C) */}
      <section className="relative bg-gradient-to-b from-[#B71C1C] via-[#9B1212] to-[#7f0e0e] text-white pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-white mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            {t('hero.title')}
          </h1>

          {/* Subtext */}
          <p className="mt-4 sm:mt-5 text-xl sm:text-2xl font-medium text-red-100 tracking-wide">
            {t('hero.subtitle')}
          </p>

          {/* QUICK SEARCH CARD (White card on top of hero, rounded-12px = rounded-xl) */}
          <div className="mt-8 sm:mt-12 bg-white text-[#222222] rounded-2xl shadow-2xl p-5 sm:p-8 max-w-3xl mx-auto border border-gray-100 text-left transition-all">
            <form onSubmit={handleSearchSubmit}>
              {/* Blood group selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold uppercase tracking-wider text-[#616161] mb-3">
                  {t('hero.selectBloodGroup')}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
                  {BLOOD_GROUPS.map((group) => {
                    const isSelected = selectedGroup === group
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedGroup(group)}
                        className={`tap-target h-12 w-full rounded-xl font-bold text-base transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#D32F2F] text-white shadow-md ring-2 ring-[#B71C1C] ring-offset-2 scale-105'
                            : 'bg-[#FBEFEF] text-[#B71C1C] hover:bg-red-100 border border-red-100'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {group}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* City Selection & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
                <div className="sm:col-span-7">
                  <label htmlFor="city-select" className="block text-sm font-bold uppercase tracking-wider text-[#616161] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D32F2F]" />
                    {t('hero.selectCity')}
                  </label>
                  <div className="relative">
                    <select
                      id="city-select"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="tap-target w-full h-12 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-base text-[#222222] focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="">{t('hero.chooseCity')}</option>
                      {MAJOR_CITIES.map((city) => (
                        <option key={city.id} value={city.name}>
                          {t(`cities.${city.id}`, { defaultValue: city.name })}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <button
                    type="submit"
                    className="tap-target w-full h-12 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    <span>{t('hero.searchDonors')}</span>
                  </button>
                </div>
              </div>

              {/* Divider & Secondary Action */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-[#616161] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>{t('hero.helperText')}</span>
                </p>

                <Link
                  to="/register"
                  className="tap-target w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold text-[#B71C1C] bg-[#FBEFEF] hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-[#D32F2F]" />
                  <span>{t('hero.becomeDonorBtn')}</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. LIVE IMPACT STRIP (Placeholder numbers) */}
      <section className="bg-white border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8 shadow-xs relative z-20 -mt-6 sm:-mt-10 max-w-6xl mx-auto w-full rounded-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222222]">
            {t('impact.title')}
          </h2>
          <p className="text-sm text-[#616161] mt-1">
            {t('impact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Donors Counter */}
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FBEFEF] text-[#D32F2F] mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#B71C1C] tracking-tight">
              {t('impact.donorsCount')}
            </div>
            <div className="text-sm font-semibold text-[#616161] uppercase tracking-wider mt-1">
              {t('impact.donorsLabel')}
            </div>
          </div>

          {/* Requests Solved Counter */}
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-[#2E7D32] mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#2E7D32] tracking-tight">
              {t('impact.requestsCount')}
            </div>
            <div className="text-sm font-semibold text-[#616161] uppercase tracking-wider mt-1">
              {t('impact.requestsLabel')}
            </div>
          </div>

          {/* Cities Covered Counter */}
          <div className="pt-4 md:pt-0 md:px-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-[#F9A825] mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-700 tracking-tight">
              {t('impact.citiesCount')}
            </div>
            <div className="text-sm font-semibold text-[#616161] uppercase tracking-wider mt-1">
              {t('impact.citiesLabel')}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center text-gray-400 mt-5 italic">
          * {t('impact.disclaimer')}
        </p>
      </section>

      {/* 3. HOW IT WORKS (3 steps with icons) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF] rounded-full mb-3">
              {t('howItWorks.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
              {t('howItWorks.title')}
            </h2>
            <p className="text-base sm:text-lg text-[#616161] mt-3">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs border border-gray-200/80 hover:shadow-md transition-shadow relative">
              <div className="w-14 h-14 rounded-2xl bg-[#FBEFEF] flex items-center justify-center text-[#D32F2F] mb-6 shadow-2xs font-bold text-xl">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                {t('howItWorks.step1Title')}
              </h3>
              <p className="text-sm text-[#616161] leading-relaxed">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs border border-gray-200/80 hover:shadow-md transition-shadow relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 mb-6 shadow-2xs font-bold text-xl">
                <Search className="w-7 h-7 text-[#F9A825]" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                {t('howItWorks.step2Title')}
              </h3>
              <p className="text-sm text-[#616161] leading-relaxed">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 shadow-xs border border-gray-200/80 hover:shadow-md transition-shadow relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2E7D32] mb-6 shadow-2xs font-bold text-xl">
                <PhoneCall className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] mb-3">
                {t('howItWorks.step3Title')}
              </h3>
              <p className="text-sm text-[#616161] leading-relaxed">
                {t('howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY TRUST US (Privacy, OTP, 100% Free, Donor in Control) */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-emerald-50 rounded-full mb-3">
              {t('trust.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
              {t('trust.title')}
            </h2>
            <p className="text-base sm:text-lg text-[#616161] mt-3">
              {t('trust.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Privacy First */}
            <div className="p-6 rounded-2xl bg-[#FBEFEF]/50 border border-red-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#D32F2F] flex items-center justify-center shadow-xs mb-5">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">
                  {t('trust.feature1Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('trust.feature1Desc')}
                </p>
              </div>
            </div>

            {/* Feature 2: OTP Verified */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#2E7D32] flex items-center justify-center shadow-xs mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">
                  {t('trust.feature2Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('trust.feature2Desc')}
                </p>
              </div>
            </div>

            {/* Feature 3: 100% Free Forever */}
            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#F9A825] flex items-center justify-center shadow-xs mb-5">
                  <HeartHandshake className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">
                  {t('trust.feature3Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('trust.feature3Desc')}
                </p>
              </div>
            </div>

            {/* Feature 4: Donor in Control */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-xs mb-5">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#222222] mb-2">
                  {t('trust.feature4Title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                  {t('trust.feature4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARTNERS STRIP */}
      <section className="py-12 bg-gray-50 border-y border-gray-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#616161]">
            {t('partners.badge')}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#222222] mt-1 mb-6">
            {t('partners.title')}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 bg-white rounded-xl border border-gray-200/70 text-xs sm:text-sm font-semibold text-[#616161] shadow-2xs hover:border-red-200 hover:text-[#D32F2F] transition-colors"
              >
                {t(`partners.partner${idx}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DONOR FAQ + REQUESTER FAQ (Interactive Accordion) */}
      <section id="faq" className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF] rounded-full mb-3">
              {t('faq.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
              {t('faq.title')}
            </h2>
            <p className="text-base text-[#616161] mt-2">
              {t('faq.subtitle')}
            </p>

            {/* Tab switchers: For Donors / For Requesters */}
            <div className="mt-8 inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setActiveFaqTab('donors')
                  setOpenFaqIndex(0)
                }}
                className={`tap-target px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeFaqTab === 'donors'
                    ? 'bg-white text-[#D32F2F] shadow-xs'
                    : 'text-[#616161] hover:text-[#222222]'
                }`}
              >
                {t('faq.tabDonors')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFaqTab('requesters')
                  setOpenFaqIndex(0)
                }}
                className={`tap-target px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeFaqTab === 'requesters'
                    ? 'bg-white text-[#D32F2F] shadow-xs'
                    : 'text-[#616161] hover:text-[#222222]'
                }`}
              >
                {t('faq.tabRequesters')}
              </button>
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {currentFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="tap-target w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 bg-white hover:bg-gray-50/80 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-base sm:text-lg text-[#222222]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#D32F2F]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-[#616161] leading-relaxed bg-white border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-red-100 text-sm sm:text-base leading-relaxed">
              {t('cta.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              to="/register"
              className="tap-target w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#B71C1C] font-bold text-base hover:bg-red-50 shadow-lg flex items-center justify-center gap-2"
            >
              <span>{t('cta.registerBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/find"
              className="tap-target w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-900/60 hover:bg-red-900/80 text-white font-bold text-base border border-red-400/40 flex items-center justify-center gap-2"
            >
              <span>{t('cta.searchBtn')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
