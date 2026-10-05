import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  Lock,
  Trash2,
  EyeOff,
  UserCheck,
  AlertCircle,
  FileText,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Key
} from 'lucide-react'

export default function PrivacyPage() {
  const { t, i18n } = useTranslation()
  const isHindi = (i18n.language || 'en').startsWith('hi')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF]">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight">
            {isHindi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
          </h1>
          <p className="text-sm sm:text-base text-[#616161] max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? 'सरल, पारदर्शी और स्पष्ट भाषा में जानकारी — हम आपका कौन-सा डेटा एकत्र करते हैं, इसे कैसे सुरक्षित रखते हैं और आप इसे कभी भी कैसे हटा सकते हैं।'
              : 'Plain-language, transparent explanation of what data BloodAccess collects, why, how it is protected from public view, and how you retain full control over it.'}
          </p>
          <p className="text-xs text-gray-400">
            {isHindi ? 'अंतिम अद्यतन: मार्च 2026 • संस्करण v1.0' : 'Last updated: March 2026 • Policy Version v1.0'}
          </p>
        </div>

        {/* 4 Pillars Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#222222]">
              {isHindi ? 'फ़ोन कभी सार्वजनिक नहीं' : 'Phone Never Public'}
            </h4>
            <p className="text-xs text-[#616161] leading-relaxed">
              {isHindi
                ? 'आपका मोबाइल नंबर इंटरनेट पर खुला नहीं रहता। केवल ओटीपी-सत्यापित अनुरोधकर्ता ही संपर्क देख सकते हैं।'
                : 'Your mobile number is never exposed in public search results. Revealed only to OTP-verified requesters.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#222222]">
              {isHindi ? 'डेटा बिक्री शून्य' : 'Zero Data Selling'}
            </h4>
            <p className="text-xs text-[#616161] leading-relaxed">
              {isHindi
                ? 'हम आपका डेटा किसी भी बीमा कंपनी, अस्पताल या विज्ञापनदाताओं को नहीं बेचते या साझा करते हैं।'
                : 'We never sell, rent, or monetize personal data with insurers, commercial labs, or marketing agencies.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D32F2F] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#222222]">
              {isHindi ? '1-क्लिक डेटा विलोपन' : '1-Click Data Erasure'}
            </h4>
            <p className="text-xs text-[#616161] leading-relaxed">
              {isHindi
                ? 'अपने डैशबोर्ड से कभी भी "मेरा डेटा हटाएं" बटन दबाकर अपना पूरा खाता तुरंत स्थायी रूप से मिटाएं।'
                : 'You have the right to permanently erase your donor profile and contact records anytime from your dashboard.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#222222]">
              {isHindi ? 'एंटी-स्पैम सीमा' : 'Anti-Spam Limits'}
            </h4>
            <p className="text-xs text-[#616161] leading-relaxed">
              {isHindi
                ? 'प्रत्येक अनुरोधकर्ता 24 घंटे में अधिकतम 5 रक्तदाताओं से ही संपर्क कर सकता है ताकि अनावश्यक कॉल न आएं।'
                : 'Requesters can reveal at most 5 donors per 24 hours to protect generous volunteers from call flooding.'}
            </p>
          </div>
        </div>

        {/* Section 1: What We Collect & What We NEVER Collect */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '1. डेटा न्यूनीकरण — हम क्या एकत्र करते हैं' : '1. Data Minimization — What We Collect and Why'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'हम केवल उतना ही डेटा लेते हैं जितना आपातकाल में संपर्क कराने के लिए ज़रूरी है।' : 'In compliance with DPDP Act 2023, we collect only the minimum information necessary to save a life.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What we collect */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'हम क्या एकत्र करते हैं' : 'What We Collect'}</span>
              </h3>
              <ul className="space-y-3 text-xs text-gray-700">
                <li className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/80">
                  <b className="text-gray-900 block mb-0.5">{isHindi ? 'स्वैच्छिक रक्तदाता (Donors):' : 'Voluntary Blood Donors:'}</b>
                  {isHindi
                    ? 'पूरा नाम, मोबाइल नंबर, ब्लड ग्रुप (A+, B+, आदि), आयु, लिंग, अनुमानित वजन, शहर और क्षेत्र, अंतिम रक्तदान तिथि (कूलडाउन गणना हेतु) और संपर्क प्राथमिकता।'
                    : 'Full name, mobile number, blood group (A+, O+, etc.), age, gender, weight, state, city & area, last donation date (for calculating health cooldown), and contact preference.'}
                </li>
                <li className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/80">
                  <b className="text-gray-900 block mb-0.5">{isHindi ? 'अनुरोधकर्ता (Requesters):' : 'Emergency Requesters:'}</b>
                  {isHindi
                    ? 'अनुरोधकर्ता का नाम, मोबाइल नंबर (ओटीपी द्वारा सत्यापित), मरीज़ का ब्लड ग्रुप, अस्पताल का नाम और शहर।'
                    : 'Requester name, mobile phone number (strictly verified via SMS OTP before any contact reveal), patient blood group, hospital name and city.'}
                </li>
              </ul>
            </div>

            {/* What we NEVER collect */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>{isHindi ? 'हम क्या कभी एकत्र नहीं करते' : 'What We Strictly NEVER Collect'}</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2.5 bg-red-50/30 rounded-xl border border-red-100 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{isHindi ? 'मरीज़ का नाम, मेडिकल इतिहास या बीमारी का ब्यौरा।' : 'Patient personal identity, disease diagnosis, or clinical case papers.'}</span>
                </li>
                <li className="p-2.5 bg-red-50/30 rounded-xl border border-red-100 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{isHindi ? 'आधार कार्ड, पैन कार्ड या अन्य राष्ट्रीय पहचान पत्र की प्रतियां।' : 'Copies of Aadhaar cards, PAN cards, or sensitive government identity proofs.'}</span>
                </li>
                <li className="p-2.5 bg-red-50/30 rounded-xl border border-red-100 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{isHindi ? 'बैंक खाता, यूपीआई, क्रेडिट कार्ड या कोई भी वित्तीय विवरण।' : 'Financial information, bank accounts, UPI handles, or credit card details.'}</span>
                </li>
                <li className="p-2.5 bg-red-50/30 rounded-xl border border-red-100 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{isHindi ? 'पासवर्ड (हम केवल सुरक्षित फ़ोन ओटीपी पर काम करते हैं)।' : 'Account passwords (we operate entirely on passwordless phone OTP authentication).'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: How Phone Numbers are Safeguarded */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '2. रक्तदाताओं के फ़ोन नंबरों की सुरक्षा' : '2. How Donor Phone Numbers Are Safeguarded'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'सार्वजनिक खोज और अनधिकृत कॉल से पूर्ण सुरक्षा।' : 'Architecture-level guarantees against phone harvesting, scraping, and telemarketing.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              {isHindi
                ? 'BloodAccess का सार्वजनिक खोज पृष्ठ डेटाबेस व्यू (public_donors) से डेटा पढ़ता है। इस व्यू में रक्तदाता का फ़ोन नंबर और पूरा नाम तकनीकी रूप से मौजूद ही नहीं होता। केवल पहला नाम और उपनाम का पहला अक्षर (जैसे "रमेश के.") दिखाई देता है।'
                : 'BloodAccess public search reads exclusively from an isolated database view (public_donors). This database view physically strips out telephone numbers and full surnames, rendering automated web scraping impossible.'}
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <p className="font-bold text-gray-900">
                {isHindi ? 'फ़ोन नंबर केवल तभी प्रकट होता है जब:' : 'Phone Numbers Are Disclosed Only When:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{isHindi ? 'अनुरोधकर्ता अपना मोबाइल नंबर दर्ज कर एसएमएस ओटीपी द्वारा प्रमाणित करता है।' : 'The emergency requester enters their own active mobile number and verifies it via instant SMS OTP.'}</li>
                <li>{isHindi ? 'अनुरोधकर्ता ने पिछले 24 घंटों में 5 से अधिक रक्तदाताओं का संपर्क नहीं देखा हो।' : 'The requester has not exceeded the strict anti-misuse quota of 5 reveals per 24 hours.'}</li>
                <li>{isHindi ? 'रक्तदाता वर्तमान में सक्रिय और उपलब्ध हो (रक्तदान के कूलडाउन में न हो)।' : 'The voluntary donor is verified as active and not in an obligatory clinical cooldown period.'}</li>
                <li>{isHindi ? 'प्रत्येक संपर्क का ऑडिट रिकॉर्ड सिस्टम में सुरक्षित रूप से दर्ज किया जाता है।' : 'Every reveal event is timestamped and logged with the patient blood group and hospital for abuse tracking.'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Right to Permanent Erasure */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '3. स्थायी रूप से डेटा हटाने का अधिकार (Right to Erasure)' : '3. Right to Permanent Erasure & Account Deletion'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'DPDP Act 2023 की धारा 12 के अनुसार आपका पूर्ण अधिकार।' : 'Enforcing Section 12 of the Digital Personal Data Protection Act 2023.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              {isHindi
                ? 'यदि आप कभी भी स्वेच्छा से अपना रक्तदान पंजीकरण समाप्त करना चाहते हैं, तो आपको किसी ईमेल या सहायता टिकट की आवश्यकता नहीं है। आप सीधे अपने डैशबोर्ड पर जाकर "मेरा खाता और पूरा डेटा हटाएं" बटन दबा सकते हैं।'
                : 'If you ever wish to cease voluntary participation, you are not required to file cumbersome support tickets or wait days for manual processing. You have direct self-service deletion authority.'}
            </p>
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span>{isHindi ? 'खाता हटाने पर क्या होता है?' : 'What Happens When You Delete Your Account?'}</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                <li>{isHindi ? 'आपका पूरा प्रोफ़ाइल, फ़ोन नंबर, रक्तदान लॉग और स्थान डेटाबेस से तुरंत स्थायी रूप से मिटा दिया जाता है।' : 'Your full profile, mobile telephone number, location coordinates, and donation logs are purged from active production databases.'}</li>
                <li>{isHindi ? 'आप किसी भी खोज परिणाम में कभी दिखाई नहीं देंगे और कोई भी आपको संपर्क नहीं कर पाएगा।' : 'Your contact disappears immediately from all search indexes and no future inquiries can be routed to you.'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Ethics, Commercial Prohibition & Contact */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '4. डेटा संरक्षण अधिकारी एवं संपर्क' : '4. Grievance Redressal & Data Protection Officer'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'किसी भी प्रश्न या शिकायत के लिए हमारे संपर्क विवरण।' : 'Designated officer for data privacy inquiries under Indian statutory regulations.'}
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              {isHindi
                ? 'यदि आपके पास इस गोपनीयता नीति, डेटा सुरक्षा, या अपने अधिकारों के प्रयोग के संबंध में कोई प्रश्न है, तो आप हमारे समर्पित डेटा संरक्षण संपर्क से जुड़ सकते हैं:'
                : 'For inquiries regarding this privacy framework, data practices, or exercising statutory rights, you may reach our dedicated Grievance Officer:'}
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1 text-gray-800 font-mono">
              <p><b>Grievance Officer:</b> BloodAccess Community Trust Data Cell</p>
              <p><b>Email:</b> privacy@bloodaccess.org / support@bloodaccess.org</p>
              <p><b>Statutory Framework:</b> Digital Personal Data Protection Act, 2023 (Republic of India)</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/terms"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] hover:underline"
              >
                <span>{isHindi ? 'सेवा की शर्तें पढ़ें' : 'Read Terms of Service'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] hover:underline"
              >
                <span>{isHindi ? 'हमसे संपर्क करें' : 'Contact Support'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
