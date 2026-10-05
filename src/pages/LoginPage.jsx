import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LogIn,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Droplet
} from 'lucide-react'
import supabase from '../lib/supabaseClient'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Format to +91XXXXXXXXXX
  const formatPhone = (raw) => {
    if (!raw) return ''
    const digits = raw.replace(/[^0-9]/g, '')
    if (digits.startsWith('91') && digits.length > 10) {
      return `+${digits}`
    }
    return `+91${digits.slice(-10)}`
  }

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const clean = phone.replace(/[^0-9]/g, '')
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    const formatted = formatPhone(phone)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formatted,
      })

      if (error) {
        console.warn('signInWithOtp error:', error.message)
        setErrorMsg(`${error.message}. (You can use test credentials or click Quick Test Login below)`)
      }
      setOtpSent(true)
    } catch (err) {
      console.error('Login error:', err)
      setErrorMsg('Could not send OTP. You can proceed with Quick Test Login.')
      setOtpSent(true)
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (isTestBypass = false) => {
    setErrorMsg('')
    const rawInput = phone || (isTestBypass ? '9631977964' : '')
    const formatted = formatPhone(rawInput)

    if (!isTestBypass && (!otpCode || otpCode.length < 6)) {
      setErrorMsg('Please enter the 6-digit OTP code')
      return
    }

    setLoading(true)

    try {
      let authUserId = null

      if (!isTestBypass) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formatted,
          token: otpCode,
          type: 'sms',
        })

        if (error) {
          throw new Error(error.message || 'Invalid or expired OTP')
        }
        authUserId = data?.user?.id || null
      }

      // 1. Try secure RPC lookup first
      let donorData = null
      const { data: rpcResult } = await supabase.rpc('donor_login_lookup', {
        p_phone: formatted
      })

      if (rpcResult && rpcResult.found) {
        donorData = rpcResult
      }

      // 2. If not found via RPC, try direct query or public_donors check
      if (!donorData) {
        const { data: directList } = await supabase
          .from('donors')
          .select('*')
          .eq('phone', formatted)
          .limit(1)

        if (directList && directList[0]) {
          donorData = directList[0]
        }
      }

      // 3. In Test Mode: if no donor exists with this number yet, automatically create one!
      if (!donorData && isTestBypass) {
        const testId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
        const newTestDonor = {
          ...(testId ? { id: testId } : {}),
          user_id: authUserId,
          full_name: 'Test Voluntary Donor',
          age: 24,
          gender: 'male',
          phone: formatted,
          blood_group: 'O+',
          weight_kg: 65,
          state: 'Bihar',
          city: 'Patna',
          area: 'Kankarbagh',
          contact_pref: 'both',
          is_available: true,
          status: 'active',
          consent_version: 'v1.0',
          consent_at: new Date().toISOString()
        }

        const { error: insertErr } = await supabase
          .from('donors')
          .insert([newTestDonor])

        if (!insertErr) {
          donorData = newTestDonor
        } else {
          // If insert had an issue, fallback to client test session
          donorData = { ...newTestDonor, id: testId || 'test-donor-1' }
        }
      }

      // 4. If still not found and NOT test mode:
      if (!donorData) {
        setErrorMsg(t('loginPage.notRegisteredErr'))
        setLoading(false)
        return
      }

      // If auth user id is available, link it
      if (authUserId && donorData.id && !donorData.user_id) {
        await supabase
          .from('donors')
          .update({ user_id: authUserId })
          .eq('id', donorData.id)
      }

      // Save donor session in localStorage for local state persistence
      localStorage.setItem('bloodaccess_donor_phone', formatted)
      if (donorData.id) {
        localStorage.setItem('bloodaccess_donor_id', donorData.id)
      }
      localStorage.setItem('bloodaccess_donor_profile', JSON.stringify(donorData))

      navigate('/dashboard')
    } catch (err) {
      console.error('Verify error:', err)
      setErrorMsg(err.message || 'Login verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FBEFEF] text-[#D32F2F] flex items-center justify-center mx-auto shadow-2xs">
            <Droplet className="w-7 h-7 fill-[#D32F2F]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
            {t('loginPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
            {t('loginPage.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="loginPhone" className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1.5">
              {t('loginPage.phoneLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-sm font-bold text-gray-500">
                +91
              </span>
              <input
                id="loginPhone"
                type="tel"
                maxLength={10}
                placeholder={t('loginPage.phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="tap-target w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 text-base font-medium focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F]"
                disabled={otpSent}
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="tap-target w-full h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? t('loginPage.sending') : t('loginPage.sendOtp')}</span>
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-gray-100 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="loginOtp" className="block text-xs font-bold uppercase tracking-wider text-[#616161]">
                    {t('loginPage.otpLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-[#D32F2F] font-semibold hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  id="loginOtp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="tap-target w-full h-12 px-4 rounded-xl border border-gray-300 font-mono text-xl tracking-widest text-center focus:ring-2 focus:ring-[#D32F2F] bg-gray-50/50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp(false)}
                disabled={loading || otpCode.length < 6}
                className="tap-target w-full h-12 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? t('loginPage.verifying') : t('loginPage.verifyLogin')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Test Mode Helper (kept active for testing) */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-gray-400" />
              Test helper:
            </span>
            <button
              type="button"
              onClick={() => handleVerifyOtp(true)}
              className="text-xs font-bold text-[#D32F2F] hover:underline cursor-pointer"
            >
              {t('loginPage.quickTest')}
            </button>
          </div>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-[#616161]">
            {t('loginPage.noAccount')}{' '}
            <Link to="/register" className="text-[#D32F2F] font-bold hover:underline">
              {t('loginPage.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
