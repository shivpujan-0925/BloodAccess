import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Scale,
  AlertTriangle,
  HeartHandshake,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  Ban,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function TermsPage() {
  const { t, i18n } = useTranslation()
  const isHindi = (i18n.language || 'en').startsWith('hi')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#D32F2F] bg-[#FBEFEF]">
            <Scale className="w-4 h-4" />
            <span>Ethical Standards & Voluntary Community Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight">
            {isHindi ? 'सेवा की शर्तें एवं नैतिक नियम (Terms of Service)' : 'Terms of Service & Code of Ethics'}
          </h1>
          <p className="text-sm sm:text-base text-[#616161] max-w-2xl mx-auto leading-relaxed">
            {isHindi
              ? 'BloodAccess का उपयोग करने से पहले कृपया इन सरल एवं स्पष्ट नियमों को समझें। हमारा उद्देश्य स्वैच्छिक रक्तदान को सुरक्षित, निःशुल्क और सुलभ बनाना है।'
              : 'Clear, plain-language guidelines governing voluntary blood donors, emergency requesters, and our strict zero-commercial ethics.'}
          </p>
        </div>

        {/* Supreme Court & Legal Banner on Zero Commercial Blood */}
        <div className="bg-red-50/70 border-2 border-red-300 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#B71C1C] font-black text-sm uppercase tracking-wide">
            <Ban className="w-5 h-5 shrink-0" />
            <span>
              {isHindi ? 'भारतीय कानून के तहत रक्त बेचना या खरीदना सख्त अपराध है' : 'Strict Legal Prohibition on Buying or Selling Blood'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-red-950 font-medium leading-relaxed">
            {isHindi
              ? 'औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 तथा भारत के माननीय सर्वोच्च न्यायालय के ऐतिहासिक निर्णय (Common Cause बनाम भारत संघ, 1996) के अनुसार भारत में रक्त बेचना, खरीदना या इसके लिए किसी भी प्रकार का आर्थिक लेन-देन करना एक गैर-जमानती दण्डनीय अपराध है।'
              : 'Under the Drugs and Cosmetics Act (1940 & Rules) and the Supreme Court of India judgment (Common Cause vs. Union of India, 1996), commercial trading, selling, or purchasing of human blood is strictly illegal and a punishable criminal offense across the Republic of India.'}
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-red-200 text-xs text-red-900 font-bold">
            {isHindi
              ? 'BloodAccess पर कोई भी व्यक्ति जो पैसे की मांग करता है या पैसे की पेशकश करता है, उसे तत्काल निलंबित कर दिया जाएगा और कानूनी अधिकारियों को रिपोर्ट किया जाएगा।'
              : 'Anyone on BloodAccess demanding money, cash gifts, or travel compensation will be permanently banned and reported to law enforcement authorities.'}
          </div>
        </div>

        {/* Section 1: Platform Role & Non-Medical Disclaimer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '1. मंच की भूमिका — हम क्या हैं और क्या नहीं' : '1. Nature of Platform — What We Are and Are Not'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'BloodAccess केवल स्वैच्छिक संपर्क का साधन है, कोई रक्त बैंक नहीं।' : 'BloodAccess is a communication utility, not a medical establishment.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              {isHindi
                ? 'BloodAccess केवल एक तकनीकी मंच है जो ज़रूरत के समय स्वैच्छिक रक्तदाताओं को उन परिवारों से जोड़ने में मदद करता है जिन्हें आपातकाल में रक्त की आवश्यकता है।'
                : 'BloodAccess functions solely as a technology matchmaking bridge connecting voluntary, altruistic donors with patients in urgent need.'}
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
              <p className="font-bold text-gray-900">
                {isHindi ? 'महत्वपूर्ण सीमाएं (Explicit Disclaimers):' : 'Key Operational Disclaimers:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>{isHindi ? 'BloodAccess कोई रक्त बैंक, पैथोलॉजी लैब, अस्पताल या चिकित्सा सेवा प्रदाता नहीं है।' : 'BloodAccess is not a blood bank, diagnostic pathology laboratory, or clinical medical facility.'}</li>
                <li>{isHindi ? 'हम रक्त का संग्रह, परीक्षण, भंडारण या वितरण नहीं करते हैं।' : 'We do not collect, test for infectious markers, store, preserve, or transport human blood or components.'}</li>
                <li>{isHindi ? 'रक्तदान की अंतिम चिकित्सीय पात्रता केवल अस्पताल या अधिकृत रक्त बैंक के डॉक्टर द्वारा रक्तदान के समय ही तय की जाती है।' : 'Final clinical eligibility and safety screening is determined solely by the qualified medical officer at the licensed blood bank at the moment of donation.'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Voluntary Donor Guidelines */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '2. स्वैच्छिक रक्तदाताओं के नियम एवं स्वास्थ्य पात्रता' : '2. Voluntary Donor Guidelines & Medical Cooldown'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'राष्ट्रीय रक्त आधान परिषद (NBTC) के दिशानिर्देशों पर आधारित।' : 'Standard eligibility criteria derived from NBTC and Ministry of Health guidelines.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1.5">
                <span className="font-bold text-gray-900 block">{isHindi ? 'बुनियादी पात्रता:' : 'Basic Qualifications:'}</span>
                <p>• {isHindi ? 'आयु 18 से 65 वर्ष के बीच।' : 'Age must be between 18 and 65 years.'}</p>
                <p>• {isHindi ? 'न्यूनतम वजन 45 किलोग्राम या अधिक।' : 'Minimum weight of at least 45 kg.'}</p>
                <p>• {isHindi ? 'कोई सक्रिय बुखार, संक्रमण या गंभीर बीमारी न हो।' : 'Free from active fevers, acute infections, or transmissible blood-borne illnesses.'}</p>
              </div>

              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1.5">
                <span className="font-bold text-gray-900 block">{isHindi ? 'अनिवार्य कूलडाउन अवधि:' : 'Mandatory Clinical Cooldowns:'}</span>
                <p>• {isHindi ? 'पुरुष: दो रक्तदानों के बीच कम से कम 90 दिन (3 महीने)।' : 'Men: Minimum 90 days (3 months) rest between donations.'}</p>
                <p>• {isHindi ? 'महिलाएं: दो रक्तदानों के बीच कम से कम 120 दिन (4 महीने)।' : 'Women: Minimum 120 days (4 months) rest between donations.'}</p>
                <p>• {isHindi ? 'डैशबोर्ड में रक्तदान दर्ज करते ही कूलडाउन स्वतः लग जाता है।' : 'Cooldown is calculated automatically upon logging a donation on your dashboard.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Requesters Code of Conduct */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '3. अनुरोधकर्ताओं की आचार संहिता एवं एंटी-मिसयूज़ नियम' : '3. Requesters Code of Conduct & Anti-Misuse Rules'}
              </h2>
              <p className="text-xs text-[#616161]">
                {isHindi ? 'रक्तदाता निस्वार्थ सेवा करते हैं; उनके समय और सम्मान की रक्षा करना अनिवार्य है।' : 'Volunteers give the gift of life freely; treating them with dignity is non-negotiable.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <ul className="space-y-2 list-disc list-inside text-xs text-gray-700">
              <li>
                <b>{isHindi ? 'सच्चा आपातकाल:' : 'Genuine Medical Need:'}</b>{' '}
                {isHindi
                  ? 'रक्तदाता का संपर्क केवल वास्तविक मरीज़ के लिए ही देखें। परीक्षण या व्यावसायिक उद्देश्यों के लिए संपर्क देखना प्रतिबंधित है।'
                  : 'Contact details must only be revealed for an active, identified patient. Using the platform for speculative or testing inquiries is strictly barred.'}
              </li>
              <li>
                <b>{isHindi ? 'दैनिक सीमा (5 संपर्क / 24 घंटे):' : 'Rate Limit (5 Contacts per 24h):'}</b>{' '}
                {isHindi
                  ? 'एक नंबर से 24 घंटे में अधिकतम 5 रक्तदाताओं से ही संपर्क किया जा सकता है।'
                  : 'A single requester phone number can unlock at most 5 donors per 24 hours to prevent spam and call fatigue.'}
              </li>
              <li>
                <b>{isHindi ? '3 शिकायतों पर स्वतः निलंबन:' : 'Automated 3-Report Suspension:'}</b>{' '}
                {isHindi
                  ? 'यदि किसी उपयोगकर्ता के विरुद्ध पैसे मांगने या अभद्र व्यवहार की 3 सत्यापित शिकायतें आती हैं, तो उसे सिस्टम से स्वतः निलंबित कर दिया जाता है।'
                  : 'Any profile receiving 3 verified misuse reports (asking for payment, fake details, abuse) is automatically suspended pending moderator review.'}
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4: Emergency Disclaimer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#222222]">
                {isHindi ? '4. गंभीर आपातकालीन सूचना (Critical Notice)' : '4. Critical Medical Emergency Advisory'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {isHindi
              ? 'यदि आपके मरीज़ की स्थिति अति-गंभीर है, तो कृपया केवल BloodAccess पर निर्भर न रहें। साथ ही तुरंत अपने अस्पताल के रक्त बैंक, ज़िला ब्लड सेंटर, रेड क्रॉस या आपातकालीन 108/102 नंबर पर भी संपर्क करें।'
              : 'If your patient is in critical or life-threatening condition, do NOT rely solely on voluntary internet matching. Concurrently alert your treating hospital blood bank, district government blood centers, Red Cross emergency services, or dial 108/104 helpline.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] hover:underline"
            >
              <span>{isHindi ? 'गोपनीयता नीति पढ़ें' : 'Read Privacy Policy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] hover:underline"
            >
              <span>{isHindi ? 'देखें यह कैसे काम करता है' : 'How BloodAccess Works'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
