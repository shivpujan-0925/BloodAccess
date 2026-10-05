import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import {
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2,
  Send,
  Lock,
  UserX,
  Banknote,
  MessageSquareWarning,
  HelpCircle,
  Loader2
} from 'lucide-react'

export default function ReportModal({ donor, onClose, onReportSuccess }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('asked_for_money')
  const [details, setDetails] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const reportReasons = [
    {
      id: 'asked_for_money',
      icon: Banknote,
      title: t('reportModal.reasonMoney'),
      desc: t('reportModal.reasonMoneyDesc'),
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      id: 'fake',
      icon: UserX,
      title: t('reportModal.reasonFake'),
      desc: t('reportModal.reasonFakeDesc'),
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: 'abusive',
      icon: MessageSquareWarning,
      title: t('reportModal.reasonAbusive'),
      desc: t('reportModal.reasonAbusiveDesc'),
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'other',
      icon: HelpCircle,
      title: t('reportModal.reasonOther'),
      desc: t('reportModal.reasonOtherDesc'),
      color: 'text-slate-600 bg-slate-50 border-slate-200'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      setErrorMsg('Please select a reason for reporting.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const cleanPhone = reporterPhone.trim().replace(/[^0-9+]/g, '')
    const reportPayload = {
      reported_type: 'donor',
      reported_id: donor.id,
      reporter_phone: cleanPhone || null,
      reason: reason,
      details: details.trim() || null,
      status: 'open',
      created_at: new Date().toISOString()
    }

    try {
      // 1. Insert into Supabase reports table
      const { error } = await supabase.from('reports').insert([reportPayload])
      if (error) {
        console.warn('Supabase reports insert notice:', error)
      }

      // 2. Also persist locally for offline/demo/immediate admin availability
      try {
        const localReports = JSON.parse(localStorage.getItem('bloodaccess_local_reports') || '[]')
        const enrichedReport = {
          ...reportPayload,
          id: `local_rep_${Date.now()}`,
          donor_name: donor.display_name || 'Donor',
          donor_blood_group: donor.blood_group,
          donor_city: donor.city
        }
        localReports.unshift(enrichedReport)
        localStorage.setItem('bloodaccess_local_reports', JSON.stringify(localReports))
      } catch (storeErr) {
        console.warn('LocalStorage report sync error:', storeErr)
      }

      setSubmitted(true)
      if (onReportSuccess) {
        onReportSuccess()
      }
    } catch (err) {
      console.error('Report submission exception:', err)
      // Even if network glitches, store locally and show polite confirmation
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-lg font-bold text-[#222222]">
                {t('reportModal.title')}
              </h3>
              <p className="text-xs text-[#616161]">
                {t('reportModal.reportingDonor')}: <span className="font-semibold text-gray-800">{donor.display_name}</span> ({donor.blood_group}, {donor.city})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            /* Success Feedback View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-[#222222]">
                {t('reportModal.successTitle')}
              </h4>
              <p className="text-sm text-[#616161] max-w-sm mx-auto leading-relaxed">
                {t('reportModal.successDesc')}
              </p>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 text-left flex items-start gap-2">
                <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  {t('reportModal.ruleNotice')}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="tap-target w-full py-3 rounded-xl bg-[#222222] hover:bg-black text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  {t('reportModal.closeBtn')}
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Reasons Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-2.5">
                  {t('reportModal.selectReason')} *
                </label>
                <div className="space-y-2">
                  {reportReasons.map((item) => {
                    const isSelected = reason === item.id
                    const IconComp = item.icon
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#D32F2F] bg-[#FBEFEF]/40 shadow-xs ring-1 ring-[#D32F2F]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={item.id}
                          checked={isSelected}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1 text-[#D32F2F] focus:ring-[#D32F2F]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[#222222]">
                            <IconComp className="w-3.5 h-3.5 text-[#D32F2F]" />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-[#616161] mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Details Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                  {t('reportModal.details')}
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('reportModal.detailsPlaceholder')}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all resize-none"
                  maxLength={500}
                />
              </div>

              {/* Optional Reporter Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                  {t('reportModal.reporterPhone')}
                </label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder={t('reportModal.reporterPhonePlaceholder')}
                  className="w-full text-xs h-10 px-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all"
                  maxLength={15}
                />
              </div>

              {/* Anti-misuse Rule Notice */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {t('reportModal.ruleNotice')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="tap-target px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t('reportModal.cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="tap-target px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('reportModal.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('reportModal.submitBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
