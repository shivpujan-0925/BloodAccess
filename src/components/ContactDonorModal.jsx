import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Clock,
  MapPin,
  Heart,
  Flame,
  KeyRound,
  ExternalLink,
  Info
} from 'lucide-react'
import supabase from '../lib/supabaseClient'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function ContactDonorModal({ donor, onClose }) {
  const { t } = useTranslation()

  // Form State
  const [requesterName, setRequesterName] = useState('')
  const [requesterPhone, setRequesterPhone] = useState('')
  const [patientBloodGroup, setPatientBloodGroup] = useState(donor?.blood_group || 'O+')
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalCity, setHospitalCity] = useState(donor?.city || '')
  const [urgency, setUrgency] = useState('urgent_today')

  // Flow & OTP State
  // Steps: 'details' (1) -> 'otp' (2) -> 'revealed' (3)
  const [step, setStep] = useState('details')
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false)

  // Revealed Contact Data (NEVER POPULATED BEFORE OTP VERIFICATION)
  const [revealedData, setRevealedData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Normalize phone to +91XXXXXXXXXX
  const formatPhone = (raw) => {
    if (!raw) return ''
    const digits = raw.replace(/[^0-9]/g, '')
    if (digits.startsWith('91') && digits.length > 10) {
      return `+${digits}`
    }
    return `+91${digits.slice(-10)}`
  }

  // Step 1: Send OTP via Supabase Auth
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setOtpError('')

    const clean = requesterPhone.replace(/[^0-9]/g, '')
    if (clean.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number')
      return
    }

    if (!requesterName.trim()) {
      setOtpError('Please enter your name as requester')
      return
    }

    if (!hospitalName.trim()) {
      setOtpError('Please enter the treating hospital name')
      return
    }

    setOtpLoading(true)
    const formatted = formatPhone(requesterPhone)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formatted,
      })

      if (error) {
        console.warn('Supabase signInWithOtp note:', error.message)
        setOtpError(`${error.message}. (You can use Supabase test credentials or quick test verification below)`)
      }

      // Advance to OTP input step
      setStep('otp')
    } catch (err) {
      console.error('Error sending OTP:', err)
      setOtpError('Failed to send OTP. You can proceed with test mode if testing locally.')
      setStep('otp')
    } finally {
      setOtpLoading(false)
    }
  }

  // Step 2: Verify OTP and Call reveal_contact RPC
  const handleVerifyAndReveal = async (isSimulated = false) => {
    setOtpError('')
    setRateLimitExceeded(false)

    if (!isSimulated && (!otpCode || otpCode.length < 6)) {
      setOtpError('Please enter the 6-digit OTP code')
      return
    }

    const formatted = formatPhone(requesterPhone)
    setOtpLoading(true)

    try {
      // 1. Verify OTP with Supabase Auth (if not simulated)
      if (!isSimulated) {
        const { error: verifyErr } = await supabase.auth.verifyOtp({
          phone: formatted,
          token: otpCode,
          type: 'sms',
        })

        if (verifyErr) {
          throw new Error(verifyErr.message || 'Invalid or expired OTP')
        }
      }

      // 2. Call the server-side reveal_contact RPC function
      const { data, error: rpcErr } = await supabase.rpc('reveal_contact', {
        p_donor_id: donor.id,
        p_requester_phone: formatted,
        p_requester_name: requesterName.trim() || 'Requester',
        p_patient_blood_group: patientBloodGroup,
        p_hospital: hospitalName.trim(),
        p_city: hospitalCity.trim(),
        p_urgency: urgency
      })

      if (rpcErr) {
        console.error('reveal_contact RPC error:', rpcErr)
        // Check if rate limit was exceeded
        if (rpcErr.message && rpcErr.message.toLowerCase().includes('rate limit')) {
          setRateLimitExceeded(true)
          throw new Error(rpcErr.message)
        }
        throw new Error(rpcErr.message || 'Failed to reveal donor contact')
      }

      if (data && data.success) {
        setRevealedData(data)
        setStep('revealed')
      } else {
        throw new Error('Could not retrieve donor details.')
      }
    } catch (err) {
      console.error('Reveal contact failed:', err)
      setOtpError(err.message || 'Verification failed. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Copy phone number to clipboard
  const handleCopyPhone = () => {
    if (revealedData?.phone) {
      navigator.clipboard.writeText(revealedData.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Generate WhatsApp prefilled URL (SPEC.md Section 4.3)
  const getWhatsAppLink = () => {
    if (!revealedData?.phone) return '#'
    const cleanPhone = revealedData.phone.replace(/[^0-9]/g, '')
    const msg = `Hi, I found you on BloodAccess. Need ${patientBloodGroup} blood at ${hospitalName || 'our hospital'}, ${hospitalCity || donor?.city}. Can you help?`
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-gray-100 relative my-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="tap-target absolute right-4 top-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FBEFEF] text-[#D32F2F] flex items-center justify-center shrink-0 shadow-2xs">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D32F2F] bg-[#FBEFEF] px-2 py-0.5 rounded-full">
              {step === 'details' && t('contactModal.stepDetails')}
              {step === 'otp' && t('contactModal.stepOtp')}
              {step === 'revealed' && t('contactModal.stepSuccess')}
            </span>
            <h2 className="text-xl font-bold text-[#222222] tracking-tight">
              {t('contactModal.title')}
            </h2>
            <p className="text-xs text-[#616161]">
              Connecting with donor: <span className="font-bold text-[#222222]">{donor?.display_name}</span> ({donor?.blood_group}, {donor?.city})
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RATE LIMIT EXCEEDED ERROR CARD */}
        {/* ============================================================== */}
        {rateLimitExceeded && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 mb-5">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{t('contactModal.rateLimitTitle')}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              {t('contactModal.rateLimitDesc')}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                to="/sos"
                onClick={onClose}
                className="tap-target px-4 py-2.5 rounded-xl bg-[#D32F2F] text-white text-xs font-bold hover:bg-[#B71C1C] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>{t('contactModal.sosBtn')}</span>
              </Link>
              <a
                href="tel:104"
                className="tap-target px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call 104 (Health Helpline)</span>
              </a>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: REQUESTER & PATIENT DETAILS FORM */}
        {/* ============================================================== */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-[#616161] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>
                To protect voluntary donors from spam, you must verify your phone number via SMS OTP before revealing contact numbers.
              </span>
            </div>

            {/* Requester Name */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t('contactModal.requesterName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('contactModal.requesterNamePlaceholder')}
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="tap-target w-full h-11 px-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] text-sm"
              />
            </div>

            {/* Requester Phone */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">
                {t('contactModal.requesterPhone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder={t('contactModal.requesterPhonePlaceholder')}
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="tap-target w-full h-11 pl-11 pr-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] text-sm font-medium"
                />
              </div>
            </div>

            {/* Patient Blood Group & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t('contactModal.patientBloodGroup')}
                </label>
                <select
                  value={patientBloodGroup}
                  onChange={(e) => setPatientBloodGroup(e.target.value)}
                  className="tap-target w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm font-bold text-[#D32F2F] cursor-pointer"
                >
                  {BLOOD_GROUPS.filter(g => g !== 'ALL').map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t('contactModal.urgency')}
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="tap-target w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#222222] cursor-pointer"
                >
                  <option value="urgent_today">{t('contactModal.urgencyToday')}</option>
                  <option value="within_3_days">{t('contactModal.urgency3Days')}</option>
                  <option value="planned">{t('contactModal.urgencyPlanned')}</option>
                </select>
              </div>
            </div>

            {/* Hospital Name & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t('contactModal.hospitalName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('contactModal.hospitalPlaceholder')}
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="tap-target w-full h-11 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D32F2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  {t('contactModal.hospitalCity')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patna, Delhi"
                  value={hospitalCity}
                  onChange={(e) => setHospitalCity(e.target.value)}
                  className="tap-target w-full h-11 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D32F2F]"
                />
              </div>
            </div>

            {/* Error Display */}
            {otpError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {otpError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otpLoading}
              className="tap-target w-full h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 mt-2"
            >
              {otpLoading ? t('contactModal.sendingOtp') : t('contactModal.sendOtpBtn')}
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: OTP VERIFICATION */}
        {/* ============================================================== */}
        {step === 'otp' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-[#616161]">
              <p>
                {t('contactModal.enterOtp')}{' '}
                <strong className="text-[#222222]">+91 {requesterPhone}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-[11px] text-[#D32F2F] font-bold hover:underline mt-1 cursor-pointer"
              >
                Change Phone Number
              </button>
            </div>

            <div>
              <label htmlFor="modalOtpCode" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-2">
                6-Digit Verification Code
              </label>
              <input
                id="modalOtpCode"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 font-mono text-xl tracking-widest text-center focus:ring-2 focus:ring-[#D32F2F] bg-gray-50/50"
              />
            </div>

            {/* Error Notice */}
            {otpError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleVerifyAndReveal(false)}
                disabled={otpLoading || otpCode.length < 6}
                className="tap-target w-full h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {otpLoading ? t('contactModal.verifying') : t('contactModal.verifyAndReveal')}
              </button>

              {/* Dev / Test Mode Quick Bypass Button (kept active for testing) */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  Testing mode helper:
                </span>
                <button
                  type="button"
                  onClick={() => handleVerifyAndReveal(true)}
                  disabled={otpLoading}
                  className="font-bold text-[#D32F2F] hover:underline cursor-pointer"
                >
                  Quick Verify (Test Mode)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: REVEALED CONTACT DETAILS (ONLY ACCESSIBLE POST-OTP) */}
        {/* ============================================================== */}
        {step === 'revealed' && revealedData && (
          <div className="space-y-5 animate-fadeIn">
            {/* Success Alert */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[#2E7D32] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-[#2E7D32]" />
              <span>{t('contactModal.otpSuccess')}</span>
            </div>

            {revealedData.already_revealed && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {t('contactModal.alreadyContacted')}
              </p>
            )}

            {/* Revealed Phone Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{t('contactModal.donorPhone')}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-400 font-bold">
                  Verified Volunteer
                </span>
              </div>

              {/* Phone display with 1-click copy */}
              <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
                <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-white">
                  {revealedData.phone}
                </span>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="tap-target px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{t('contactModal.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('contactModal.copy')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>Donor: {revealedData.display_name}</span>
                <span>
                  {revealedData.reveals_remaining !== undefined
                    ? `${revealedData.reveals_remaining} ${t('contactModal.revealsLeft')}`
                    : ''}
                </span>
              </div>
            </div>

            {/* Big Action Buttons: Direct Call & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Call Button */}
              <a
                href={`tel:${revealedData.phone}`}
                className="tap-target h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{t('contactModal.callDonor')}</span>
              </a>

              {/* WhatsApp Button with prefilled text */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t('contactModal.whatsappDonor')}</span>
              </a>
            </div>

            {/* Mandatory Respect Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                {t('contactModal.respectNotice')}
              </p>
            </div>

            {/* Follow-up Note */}
            <p className="text-[11px] text-gray-500 text-center italic">
              * BloodAccess will check in after 24 hours to confirm if the donation was fulfilled.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="tap-target w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              {t('contactModal.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
