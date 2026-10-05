import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  User,
  Heart,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Share2,
  Droplet,
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Home
} from 'lucide-react'
import supabase from '../lib/supabaseClient'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const INDIAN_STATES_CITIES = {
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Other'],
  'Delhi NCR': ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Other'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Bareilly', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Other'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Other'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Other'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Haldwani', 'Other'],
  'Other': ['Other City']
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+')
  const [selectedState, setSelectedState] = useState('Bihar')
  const [selectedCity, setSelectedCity] = useState('Patna')
  const [contactPref, setContactPref] = useState('both')

  // OTP State
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [authUserId, setAuthUserId] = useState(null)
  const [useTestBypass, setUseTestBypass] = useState(false)

  // Registration & Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [registeredDonor, setRegisteredDonor] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      age: 22,
      gender: 'male',
      phone: '',
      weightKg: 55,
      lastDonatedOn: '',
      area: '',
      healthCheckConfirmed: true,
      consentMandatory: false,
      consentOptional: true
    }
  })

  const watchedAge = Number(watch('age'))
  const watchedWeight = Number(watch('weightKg'))
  const watchedPhone = watch('phone')

  // Eligibility blocking checks
  const isAgeTooYoung = watchedAge && watchedAge < 18
  const isAgeTooOld = watchedAge && watchedAge > 65
  const isAgeBlocked = isAgeTooYoung || isAgeTooOld
  const isWeightTooLow = watchedWeight && watchedWeight < 45

  // Normalize phone with country code (+91)
  const formatPhoneNumber = (inputPhone) => {
    if (!inputPhone) return ''
    const cleaned = inputPhone.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      return `+${cleaned}`
    }
    return `+91${cleaned.slice(-10)}`
  }

  // Handle Send OTP via Supabase Auth
  const handleSendOtp = async () => {
    setOtpError('')
    if (!watchedPhone || watchedPhone.replace(/[^0-9]/g, '').length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number')
      return
    }

    const formattedPhone = formatPhoneNumber(watchedPhone)
    setOtpLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        console.warn('Supabase signInWithOtp response:', error.message)
        setOtpError(`${error.message}. (You can use Supabase test phone numbers or toggle dev verification below.)`)
      } else {
        setOtpSent(true)
        setOtpError('')
      }
    } catch (err) {
      console.error('Error sending OTP:', err)
      setOtpError('Failed to send OTP. Please check your network or try test verification.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError('')
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter the 6-digit verification code')
      return
    }

    const formattedPhone = formatPhoneNumber(watchedPhone)
    setOtpLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: 'sms',
      })

      if (error) {
        setOtpError(error.message)
      } else {
        setIsOtpVerified(true)
        if (data?.user?.id) {
          setAuthUserId(data.user.id)
        }
        setOtpError('')
      }
    } catch (err) {
      console.error('Error verifying OTP:', err)
      setOtpError('Verification error. Please check the code.')
    } finally {
      setOtpLoading(false)
    }
  }

  // Simulated OTP verification for quick testing / development mode
  const handleSimulatedVerify = () => {
    setIsOtpVerified(true)
    setOtpSent(true)
    setOtpError('')
    setUseTestBypass(true)
  }

  // Step 1 validation before proceeding
  const handleProceedToStep2 = async () => {
    const isValid = await trigger(['fullName', 'age', 'gender', 'phone'])
    if (!isValid) return

    if (isAgeBlocked) return

    if (!isOtpVerified) {
      setOtpError('Please verify your mobile number with OTP before continuing.')
      return
    }

    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 2 validation before proceeding
  const handleProceedToStep3 = async () => {
    const isValid = await trigger(['weightKg', 'healthCheckConfirmed'])
    if (!isValid) return

    if (isWeightTooLow) return

    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final Form Submission
  const onFormSubmit = async (formData) => {
    setSubmitError('')

    if (!formData.consentMandatory) {
      setSubmitError('You must agree to the mandatory consent checkbox to register as a donor.')
      return
    }

    setIsSubmitting(true)

    try {
      const formattedPhone = formatPhoneNumber(formData.phone)

      // Calculate next eligible date if last donation date is provided
      let calculatedNextEligible = null
      let isAvailable = true

      if (formData.lastDonatedOn) {
        const donationDate = new Date(formData.lastDonatedOn)
        const cooldownDays = formData.gender === 'female' ? 120 : 90
        donationDate.setDate(donationDate.getDate() + cooldownDays)
        calculatedNextEligible = donationDate.toISOString().split('T')[0]

        // If cooldown has not passed yet, mark temporarily unavailable
        if (donationDate > new Date()) {
          isAvailable = false
        }
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const currentUserId = authUserId || sessionData?.session?.user?.id || null

      const donorId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined

      const donorPayload = {
        ...(donorId ? { id: donorId } : {}),
        user_id: currentUserId,
        full_name: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formattedPhone,
        blood_group: selectedBloodGroup,
        weight_kg: Number(formData.weightKg),
        state: selectedState,
        city: selectedCity,
        area: formData.area ? formData.area.trim() : null,
        contact_pref: contactPref,
        is_available: isAvailable,
        last_donated_on: formData.lastDonatedOn || null,
        next_eligible_on: calculatedNextEligible,
        verification_level: 0,
        status: 'active',
        consent_version: 'v1.0',
        consent_at: new Date().toISOString()
      }

      // Perform insert without .select() so anonymous/first-time donors are not blocked by SELECT RLS
      const { error } = await supabase
        .from('donors')
        .insert([donorPayload])

      if (error) {
        console.error('Supabase donor insert error:', error)
        throw new Error(error.message || 'Database error while saving donor profile')
      }

      setRegisteredDonor(donorPayload)
    } catch (err) {
      console.error('Registration failed:', err)
      setSubmitError(err.message || 'Failed to complete registration. Please check database permissions or try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // SUCCESS SCREEN
  // ============================================================================
  if (registeredDonor) {
    const shareUrl = window.location.origin
    const shareText = encodeURIComponent(
      `🩸 I just registered as a voluntary blood donor on BloodAccess (${registeredDonor.blood_group}, ${registeredDonor.city})! You can join too or find donors nearby: ${shareUrl}`
    )
    const whatsappShareLink = `https://api.whatsapp.com/send?text=${shareText}`

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto">
          {/* Success Banner */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-[#2E7D32] mx-auto mb-4 shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222]">
              {t('register.successTitle')}
            </h1>
            <p className="mt-2 text-base sm:text-lg text-[#616161]">
              {t('register.successSubtitle')}
            </p>
          </div>

          {/* SHAREABLE DONOR CARD (Visual card for Instagram/WhatsApp) */}
          <div className="bg-gradient-to-br from-[#B71C1C] via-[#D32F2F] to-[#8E1010] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8 border border-red-800">
            {/* Background Droplet Watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Droplet className="w-64 h-64 fill-white" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Droplet className="w-5 h-5 fill-white text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">BloodAccess</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  {t('register.badgeTitle')}
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <p className="text-xs uppercase tracking-widest text-red-200 font-semibold">Voluntary Donor</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {registeredDonor.full_name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/20">
                <div className="px-4 py-2 rounded-xl bg-white text-[#B71C1C] font-black text-xl shadow-md">
                  {registeredDonor.blood_group}
                </div>
                <div className="text-sm font-medium text-red-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-200" />
                    <span>{registeredDonor.city}, {registeredDonor.state}</span>
                  </div>
                  <p className="text-xs text-red-200 mt-0.5">{t('register.donorCardTagline')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-[#222222] text-center">
              Inspire your friends and family to donate
            </h3>

            <a
              href={whatsappShareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{t('register.shareCard')}</span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to="/dashboard"
                className="tap-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold text-sm transition-colors"
              >
                <span>{t('register.dashboardBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="tap-target flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#222222] font-semibold text-sm transition-colors"
              >
                <Home className="w-4 h-4 text-[#616161]" />
                <span>{t('register.homeBtn')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MULTI-STEP REGISTRATION FORM
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF] rounded-full mb-2">
            Voluntary Lifesaver
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight">
            {t('register.title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#616161]">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#616161] mb-2 px-1">
            <span className={currentStep >= 1 ? 'text-[#D32F2F]' : ''}>{t('register.step1')}</span>
            <span className={currentStep >= 2 ? 'text-[#D32F2F]' : ''}>{t('register.step2')}</span>
            <span className={currentStep >= 3 ? 'text-[#D32F2F]' : ''}>{t('register.step3')}</span>
          </div>
          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="bg-[#D32F2F] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {/* ============================================================== */}
            {/* STEP 1: BASICS */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#D32F2F]" />
                    <span>{t('register.step1')}</span>
                  </h2>
                  <p className="text-xs text-[#616161] mt-0.5">
                    Your name and age help matching doctors. Phone number is kept completely private.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-bold text-[#222222] mb-1.5">
                    {t('register.fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder={t('register.fullNamePlaceholder')}
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 3, message: 'Minimum 3 characters required' }
                    })}
                    className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Age & Gender Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.age')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="age"
                      type="number"
                      placeholder={t('register.agePlaceholder')}
                      {...register('age', {
                        required: 'Age is required',
                        min: { value: 1, message: 'Invalid age' }
                      })}
                      className={`tap-target w-full h-12 px-4 rounded-xl border text-base ${
                        isAgeBlocked ? 'border-amber-400 bg-amber-50/50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F]`}
                    />
                    {errors.age && (
                      <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.gender')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      {...register('gender', { required: 'Please select gender' })}
                      className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base cursor-pointer"
                    >
                      <option value="male">{t('register.genderMale')}</option>
                      <option value="female">{t('register.genderFemale')}</option>
                      <option value="other">{t('register.genderOther')}</option>
                    </select>
                  </div>
                </div>

                {/* Kind Age Blocking Notice */}
                {isAgeTooYoung && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 mb-0.5">Eligibility Notice</p>
                      <p>{t('register.ageUnder18')}</p>
                    </div>
                  </div>
                )}

                {isAgeTooOld && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 mb-0.5">Eligibility Notice</p>
                      <p>{t('register.ageOver65')}</p>
                    </div>
                  </div>
                )}

                {/* Phone & OTP Verification */}
                <div className="pt-2 border-t border-gray-100">
                  <label htmlFor="phone" className="block text-sm font-bold text-[#222222] mb-1.5">
                    {t('register.phone')} (Private) <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-grow">
                      <span className="absolute left-3.5 top-3.5 text-sm font-bold text-[#616161]">
                        +91
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        maxLength={10}
                        placeholder={t('register.phonePlaceholder')}
                        disabled={isOtpVerified}
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit number'
                          }
                        })}
                        className="tap-target w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base font-medium disabled:bg-gray-100"
                      />
                    </div>

                    {!isOtpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || isAgeBlocked}
                        className="tap-target px-5 h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-bold shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {otpLoading ? 'Sending...' : otpSent ? t('register.resendOtp') : t('register.sendOtp')}
                      </button>
                    )}
                  </div>

                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                  )}

                  {/* OTP Input box */}
                  {otpSent && !isOtpVerified && (
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <label htmlFor="otpCode" className="block text-xs font-bold uppercase tracking-wider text-[#616161]">
                        {t('register.enterOtp')}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          id="otpCode"
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="tap-target w-full sm:w-48 h-12 px-4 rounded-xl border border-gray-300 bg-white font-mono text-lg tracking-widest text-center focus:ring-2 focus:ring-[#D32F2F]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || otpCode.length < 6}
                          className="tap-target px-6 h-12 rounded-xl bg-[#2E7D32] hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          {otpLoading ? 'Verifying...' : t('register.verifyOtp')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verification success badge */}
                  {isOtpVerified && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-xs sm:text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                      <span>{t('register.otpVerified')}</span>
                      {useTestBypass && <span className="text-[11px] font-normal text-emerald-700">(Test Mode)</span>}
                    </div>
                  )}

                  {/* Error display */}
                  {otpError && (
                    <div className="mt-2 text-xs text-red-600 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* Test mode helper (kept active for testing) */}
                  {!isOtpVerified && (
                    <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                        <span>Supabase test numbers or dev bypass:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleSimulatedVerify}
                        className="text-xs font-bold text-[#D32F2F] hover:underline cursor-pointer"
                      >
                        Click here to verify in Test Mode
                      </button>
                    </div>
                  )}
                </div>

                {/* Continue to Step 2 Button */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    disabled={isAgeBlocked || !isOtpVerified}
                    className="tap-target w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{t('register.nextBtn')} 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: BLOOD DETAILS */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#D32F2F]" />
                    <span>{t('register.step2')}</span>
                  </h2>
                  <p className="text-xs text-[#616161] mt-0.5">
                    Accurate blood group and health status ensures prompt and safe patient help.
                  </p>
                </div>

                {/* Blood Group Selection */}
                <div>
                  <label className="block text-sm font-bold text-[#222222] mb-2.5">
                    {t('register.bloodGroup')} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BLOOD_GROUPS.map((group) => {
                      const isSelected = selectedBloodGroup === group
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => setSelectedBloodGroup(group)}
                          className={`tap-target h-12 rounded-xl font-bold text-base transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-[#D32F2F] text-white shadow-md ring-2 ring-[#B71C1C] ring-offset-2 scale-105'
                              : 'bg-[#FBEFEF] text-[#B71C1C] hover:bg-red-100 border border-red-100'
                          }`}
                        >
                          {group}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Weight & Last Donation Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weight in kg */}
                  <div>
                    <label htmlFor="weightKg" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.weight')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="weightKg"
                      type="number"
                      placeholder={t('register.weightPlaceholder')}
                      {...register('weightKg', {
                        required: 'Weight is required',
                        min: { value: 30, message: 'Invalid weight entry' }
                      })}
                      className={`tap-target w-full h-12 px-4 rounded-xl border text-base ${
                        isWeightTooLow ? 'border-amber-400 bg-amber-50/50' : 'border-gray-300'
                      } focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F]`}
                    />
                    {errors.weightKg && (
                      <p className="text-xs text-red-600 mt-1">{errors.weightKg.message}</p>
                    )}
                  </div>

                  {/* Last Donation Date (Optional) */}
                  <div>
                    <label htmlFor="lastDonatedOn" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.lastDonationDate')}
                    </label>
                    <input
                      id="lastDonatedOn"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      {...register('lastDonatedOn')}
                      className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">Leave empty if you are a first-time donor.</p>
                  </div>
                </div>

                {/* Kind Weight Blocking Notice */}
                {isWeightTooLow && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 mb-0.5">Weight Threshold Notice</p>
                      <p>{t('register.weightUnder45')}</p>
                    </div>
                  </div>
                )}

                {/* Health & Eligibility Checklist */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                    <span>{t('register.healthChecklist')}</span>
                  </h3>
                  <ul className="text-xs text-[#616161] space-y-1.5 list-disc pl-4">
                    <li>{t('register.healthItem1')}</li>
                    <li>{t('register.healthItem2')}</li>
                    <li>{t('register.healthItem3')}</li>
                  </ul>

                  <label className="flex items-start gap-2.5 pt-2 border-t border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('healthCheckConfirmed', { required: true })}
                      className="w-4 h-4 mt-0.5 text-[#D32F2F] rounded border-gray-300 focus:ring-[#D32F2F]"
                    />
                    <span className="text-xs font-semibold text-[#222222]">
                      I confirm I am in good health today (talk to a doctor or blood bank staff if unsure).
                    </span>
                  </label>
                  <p className="text-[11px] text-gray-500 italic">
                    {t('register.healthDisclaimer')}
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="tap-target px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-[#616161] hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('register.backBtn')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    disabled={isWeightTooLow}
                    className="tap-target px-6 py-3 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{t('register.nextBtn')} 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: LOCATION & CONSENT */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D32F2F]" />
                    <span>{t('register.step3')}</span>
                  </h2>
                  <p className="text-xs text-[#616161] mt-0.5">
                    Your location enables patients nearby to reach you in emergencies.
                  </p>
                </div>

                {/* State & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.state')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value)
                        setSelectedCity(INDIAN_STATES_CITIES[e.target.value]?.[0] || 'Other')
                      }}
                      className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base cursor-pointer"
                    >
                      {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-[#222222] mb-1.5">
                      {t('register.city')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base cursor-pointer"
                    >
                      {(INDIAN_STATES_CITIES[selectedState] || ['Other']).map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Area / Locality */}
                <div>
                  <label htmlFor="area" className="block text-sm font-bold text-[#222222] mb-1.5">
                    {t('register.area')} (Optional)
                  </label>
                  <input
                    id="area"
                    type="text"
                    placeholder={t('register.areaPlaceholder')}
                    {...register('area')}
                    className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] text-base"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Helps requesters identify donors in the same neighborhood (never your full house address).
                  </p>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-bold text-[#222222] mb-2.5">
                    {t('register.contactPref')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'both', label: t('register.prefBoth') },
                      { id: 'call', label: t('register.prefCall') },
                      { id: 'whatsapp', label: t('register.prefWhatsapp') },
                    ].map((pref) => {
                      const isSelected = contactPref === pref.id
                      return (
                        <button
                          key={pref.id}
                          type="button"
                          onClick={() => setContactPref(pref.id)}
                          className={`tap-target px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#FBEFEF] text-[#B71C1C] border-[#D32F2F] shadow-xs'
                              : 'bg-white text-[#616161] border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {pref.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Explicit Consent Checkboxes (DPDP Act 2023 Compliance) */}
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  {/* Mandatory Consent */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/50 border border-red-100 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consentMandatory', {
                        required: 'You must agree to the consent terms to register'
                      })}
                      className="w-5 h-5 mt-0.5 text-[#D32F2F] rounded border-gray-300 focus:ring-[#D32F2F] cursor-pointer"
                    />
                    <div className="text-xs sm:text-sm text-[#222222] leading-relaxed">
                      <span className="font-bold text-[#B71C1C] block mb-0.5">Mandatory Privacy Consent:</span>
                      {t('register.consentMandatory')}
                    </div>
                  </label>
                  {errors.consentMandatory && (
                    <p className="text-xs text-red-600 pl-1">{errors.consentMandatory.message}</p>
                  )}

                  {/* Optional Notifications Consent */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consentOptional')}
                      className="w-5 h-5 mt-0.5 text-[#D32F2F] rounded border-gray-300 focus:ring-[#D32F2F] cursor-pointer"
                    />
                    <div className="text-xs text-[#616161] leading-relaxed">
                      <span className="font-bold text-[#222222] block mb-0.5">Optional Notifications:</span>
                      {t('register.consentOptional')}
                    </div>
                  </label>
                </div>

                {/* Submit Error Message */}
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Navigation & Submit Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="tap-target px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-[#616161] hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('register.backBtn')}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="tap-target px-8 py-3.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-base shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{t('register.submitting')}</span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span>{t('register.submitBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
