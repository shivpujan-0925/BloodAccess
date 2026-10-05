import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  UserCheck,
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  Calendar
} from 'lucide-react'

export default function HowItWorksPage() {
  const { t, i18n } = useTranslation()
  const [activeRole, setActiveRole] = useState('requester') // 'requester' | 'donor'
  const isHindi = (i18n.language || 'en').startsWith('hi')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Strip */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF]">
            <Sparkles className="w-4 h-4" />
            <span>Voluntary Matching Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight">
            {isHindi ? 'BloodAccess कैसे काम करता है?' : 'How BloodAccess Works'}
          </h1>
          <p className="text-sm sm:text-base text-[#616161] max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? 'आपातकाल में किसी बिचौलिए या दलाल के बिना स्वैच्छिक रक्तदाताओं से सीधे और सुरक्षित रूप से जुड़ें।'
              : 'A privacy-first, zero-commercial network connecting emergency patients with verified voluntary donors across India.'}
          </p>

          {/* Role Toggle Selector */}
          <div className="inline-flex p-1.5 bg-gray-200/80 rounded-2xl gap-1 mt-4">
            <button
              type="button"
              onClick={() => setActiveRole('requester')}
              className={`tap-target px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeRole === 'requester'
                  ? 'bg-[#D32F2F] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{isHindi ? 'रक्त की आवश्यकता होने पर (For Requesters)' : 'Need Blood (For Requesters)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('donor')}
              className={`tap-target px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeRole === 'donor'
                  ? 'bg-[#222222] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>{isHindi ? 'रक्तदाता बनने पर (For Donors)' : 'Give Blood (For Donors)'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROLE 1: FOR REQUESTERS */}
        {/* ============================================================== */}
        {activeRole === 'requester' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-black text-lg">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '1. नज़दीकी रक्तदाता खोजें' : '1. Search Donors Nearby'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'ब्लड ग्रुप और अपना शहर चुनें। "अभी उपलब्ध" टॉगल चालू कर तुरंत उपलब्ध दाताओं की सूची देखें।'
                      : 'Filter by patient blood group and city. Check the "Available now" toggle to prioritize volunteers ready to donate today.'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                  <span>{isHindi ? 'फ़ोन नंबर केवल सुरक्षित दृश्य में होते हैं।' : 'Numbers are concealed from web scrapers.'}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '2. फ़ोन ओटीपी से सत्यापन' : '2. Instant Phone OTP Verify'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'अस्पताल का नाम दर्ज करें और अपने मोबाइल नंबर पर आए 6-अंकों के ओटीपी को सत्यापित करें। इससे फर्जी कॉल्स रुकते हैं।'
                      : 'Enter hospital name and verify your own mobile phone via SMS OTP. This anti-abuse layer protects donors from telemarketers and scammers.'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{isHindi ? 'दैनिक सीमा: 24 घंटे में अधिकतम 5 संपर्क।' : 'Safe limit: 5 donor reveals per 24 hours.'}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-black text-lg">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '3. सीधा कॉल या व्हाट्सएप करें' : '3. Direct Call & WhatsApp'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'सत्यापन के तुरंत बाद कॉल और पूर्व-लिखित व्हाट्सएप संदेश बटन खुल जाते हैं। रक्तदाता से सीधे समन्वय करें।'
                      : 'Instantly connect via direct phone call or 1-tap WhatsApp message prefilled with patient blood group, hospital, and city.'}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                  <span>{isHindi ? '100% निःशुल्क सेवा — कोई दलाली नहीं।' : '100% free — zero fees or commission.'}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/find"
                className="tap-target inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{isHindi ? 'अभी रक्तदाता खोजें' : 'Search Blood Donors Nearby'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 2: FOR DONORS */}
        {/* ============================================================== */}
        {activeRole === 'donor' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donor Step 1 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D32F2F] flex items-center justify-center font-black text-lg">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '1. 2 मिनट में पंजीकरण' : '1. Register in 2 Minutes'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'अपना ब्लड ग्रुप, आयु, वजन (कम से कम 45 किग्रा) और स्थान दर्ज करें। मोबाइल नंबर सुरक्षित रूप से सत्यापित होता है।'
                      : 'Simple 3-step registration. Enter blood details, age, weight (>45kg), city, and verify your mobile number.'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                  <span>{isHindi ? 'NBTC दिशानिर्देशों के अनुरूप।' : 'Strict NBTC voluntary guidelines.'}</span>
                </div>
              </div>

              {/* Donor Step 2 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '2. उपलब्धता पर पूर्ण नियंत्रण' : '2. You Are Always In Control'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'अपने डैशबोर्ड से उपलब्धता को कभी भी 1-टैप में चालू या बंद करें। व्यस्त होने पर अनुपलब्ध टॉगल करें।'
                      : 'Big availability toggle on your dashboard. Pause inquiries anytime with 1 tap if traveling, working, or unwell.'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isHindi ? 'आपका नंबर कभी सार्वजनिक नहीं होता।' : 'Number never visible in public lists.'}</span>
                </div>
              </div>

              {/* Donor Step 3 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-[#222222]">
                    {isHindi ? '3. स्वतः कूलडाउन व बैज' : '3. Auto Cooldown & Badges'}
                  </h3>
                  <p className="text-xs text-[#616161] leading-relaxed">
                    {isHindi
                      ? 'रक्तदान दर्ज करते ही सिस्टम पुरुषों के लिए 90 दिन और महिलाओं के लिए 120 दिन का अनिवार्य विश्राम स्वतः लगा देता है।'
                      : 'Log your donation date. The platform automatically pauses requests during your cooldown (90 days men, 120 days women) and awards badges.'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-[11px] text-purple-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{isHindi ? 'स्वास्थ्य एवं सुरक्षा का पूरा ध्यान।' : 'Protects your clinical recovery.'}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/register"
                className="tap-target inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm shadow-md transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isHindi ? 'स्वैच्छिक रक्तदाता बनें' : 'Register as a Voluntary Donor'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Verification Levels Explainer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? 'रक्तदाता सत्यापन स्तर (Verification Levels)' : 'Donor Verification System'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'समुदाय में उच्च विश्वास और सुरक्षा सुनिश्चित करने के लिए।' : 'Ensuring high trust and accountability across the community.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[11px]">Level 0</span>
                <span>{isHindi ? 'मोबाइल सत्यापित (OTP Verified)' : 'Phone OTP Verified'}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {isHindi
                  ? 'प्रत्येक नया रक्तदाता पंजीकरण के समय सीधे एसएमएस ओटीपी से अपना सक्रिय नंबर सत्यापित करता है।'
                  : 'Default tier for all newly registered volunteers. Confirms that the mobile telephone number is real, active, and accessible.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px]">Level 1</span>
                <span>{isHindi ? 'सत्यापित स्वयंसेवक (Verified Badge)' : 'Verified Volunteer Badge'}</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-blue-950 leading-relaxed">
                {isHindi
                  ? 'रेड क्रॉस, स्थानीय एनजीओ, कॉलेज सेल या एडमिन द्वारा सत्यापित किए गए रक्तदाता या जिन्होंने पूर्व रक्तदान प्रमाण पत्र प्रस्तुत किया हो।'
                  : 'Granted to donors verified by partner NGOs, blood camps, colleges, or moderators based on past donation certificates.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
