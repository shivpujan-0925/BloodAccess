import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  MessageCircle,
  HelpCircle,
  Building,
  Flame,
  UserCheck
} from 'lucide-react'

export default function ContactPage() {
  const { t, i18n } = useTranslation()
  const isHindi = (i18n.language || 'en').startsWith('hi')

  const [formState, setFormState] = useState({
    name: '',
    contact: '',
    category: 'general',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Save inquiry to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('bloodaccess_inquiries') || '[]')
      existing.unshift({
        ...formState,
        id: `inq_${Date.now()}`,
        created_at: new Date().toISOString()
      })
      localStorage.setItem('bloodaccess_inquiries', JSON.stringify(existing))
    } catch (err) {
      console.warn('Inquiry store error:', err)
    }

    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF]">
            <HelpCircle className="w-4 h-4" />
            <span>Community Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight">
            {isHindi ? 'हमसे संपर्क करें (Contact Us)' : 'Contact Us & Community Help'}
          </h1>
          <p className="text-sm sm:text-base text-[#616161] max-w-xl mx-auto leading-relaxed">
            {isHindi
              ? 'BloodAccess स्वयंसेवी दल से जुड़ें। तकनीकी सहायता, एनजीओ साझेदारी, या डेटा गोपनीयता संबंधी प्रश्नों के लिए संपर्क करें।'
              : 'Reach out to the BloodAccess volunteer coordination desk, NGO partnerships, or our Data Protection Officer.'}
          </p>
        </div>

        {/* Urgent Emergency Warning Banner */}
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#B71C1C]">
                {isHindi ? 'क्या आपको अभी तुरंत रक्त की आवश्यकता है?' : 'Need blood urgently for an active emergency?'}
              </h3>
              <p className="text-xs text-red-900 mt-0.5 leading-relaxed">
                {isHindi
                  ? 'कृपया इस संपर्क फॉर्म के उत्तर की प्रतीक्षा न करें। तुरंत "रक्तदाता खोजें" पर जाएं या अपने अस्पताल के ब्लड बैंक से संपर्क करें।'
                  : 'Do not wait for a contact form response. Search active donors directly or alert your hospital blood bank immediately.'}
              </p>
            </div>
          </div>

          <Link
            to="/find"
            className="tap-target px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shrink-0 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{isHindi ? 'रक्तदाता खोजें' : 'Search Donors'}</span>
          </Link>
        </div>

        {/* Main Grid: Form + Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#222222]">
                  {isHindi ? 'संदेश सफलतापूर्वक प्राप्त हुआ' : 'Message Received'}
                </h3>
                <p className="text-xs text-[#616161] max-w-sm mx-auto leading-relaxed">
                  {isHindi
                    ? 'BloodAccess स्वयंसेवी दल को आपका संदेश मिल गया है। हम शीघ्र ही आपसे संपर्क करेंगे।'
                    : 'Thank you for reaching out. Our volunteer team and grievance cell will review your inquiry shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setFormState({ name: '', contact: '', category: 'general', message: '' })
                  }}
                  className="tap-target px-5 py-2.5 rounded-xl bg-[#222222] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                >
                  {isHindi ? 'नया संदेश भेजें' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-[#222222] mb-1">
                  {isHindi ? 'संदेश भेजें' : 'Send an Inquiry or Feedback'}
                </h3>
                <p className="text-xs text-[#616161] -mt-2 mb-4">
                  {isHindi
                    ? 'सभी क्षेत्रों में स्वयंसेवी प्रतिक्रिया 24-48 घंटों के भीतर दी जाती है।'
                    : 'Volunteer desk inquiries are typically reviewed within 24 hours.'}
                </p>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                    {isHindi ? 'आपका पूरा नाम' : 'Your Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder={isHindi ? 'उदा. राजेश शर्मा' : 'e.g. Rajesh Sharma'}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all"
                  />
                </div>

                {/* Email or Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                    {isHindi ? 'ईमेल या मोबाइल नंबर' : 'Email Address or Mobile Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.contact}
                    onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                    placeholder={isHindi ? 'उत्तर प्राप्त करने हेतु' : 'For our reply'}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                    {isHindi ? 'विषय श्रेणी' : 'Topic / Inquiry Type'}
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full text-xs h-10 px-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all bg-white"
                  >
                    <option value="general">{isHindi ? 'सामान्य पूछताछ (General)' : 'General Inquiry'}</option>
                    <option value="privacy_dpdp">{isHindi ? 'डेटा गोपनीयता / DPDP Act' : 'Data Privacy & DPDP Erasure Request'}</option>
                    <option value="partner_ngo">{isHindi ? 'अस्पताल / एनजीओ साझेदारी' : 'Hospital / NGO Partnership'}</option>
                    <option value="fraud_report">{isHindi ? 'दुरुपयोग / पैसे मांगने की रिपोर्ट' : 'Report Fraud / Demanding Payment'}</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#616161] mb-1">
                    {isHindi ? 'आपका संदेश' : 'Message Details'} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder={isHindi ? 'कृपया अपना संदेश या समस्या विस्तार से लिखें...' : 'How can our volunteer desk help you?'}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] outline-hidden transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tap-target w-full py-3 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isHindi ? 'संदेश भेजें' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Direct Links */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Cards */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                {isHindi ? 'सीधे संपर्क सूत्र' : 'Direct Channels'}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#D32F2F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">General Support</span>
                    <a href="mailto:support@bloodaccess.org" className="text-gray-600 hover:text-[#D32F2F]">
                      support@bloodaccess.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">DPDP Grievance Officer</span>
                    <a href="mailto:privacy@bloodaccess.org" className="text-gray-600 hover:text-blue-600">
                      privacy@bloodaccess.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">Partner & Camp Inquiries</span>
                    <a href="mailto:partners@bloodaccess.org" className="text-gray-600 hover:text-[#2E7D32]">
                      partners@bloodaccess.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                {isHindi ? 'त्वरित लिंक' : 'Quick Actions'}
              </h3>

              <div className="space-y-2 text-xs">
                <Link
                  to="/admin"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />
                    <span>Admin & Moderation Portal</span>
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  to="/how-it-works"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>How BloodAccess Works</span>
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  to="/privacy"
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span>Privacy Policy (DPDP Act)</span>
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
