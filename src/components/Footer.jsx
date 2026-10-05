import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Droplet, Heart, ShieldAlert, PhoneCall, ExternalLink } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Help Banner */}
        <div className="bg-[#B71C1C] rounded-2xl p-6 sm:p-8 mb-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-red-200">
              <ShieldAlert className="w-4 h-4" />
              <span>Critical Emergency Notice</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">In an immediate life-threatening emergency:</h3>
            <p className="text-red-100 text-sm max-w-2xl">
              Always alert your treating hospital's blood bank right away. Dial official National Emergency <strong>112</strong> or National Health Helpline <strong>104</strong> for immediate government medical coordination.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:104"
              className="tap-target px-4 py-2.5 rounded-xl bg-white text-[#B71C1C] font-bold text-sm hover:bg-red-50 flex items-center gap-2 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Call 104 (Health)
            </a>
            <a
              href="tel:112"
              className="tap-target px-4 py-2.5 rounded-xl bg-red-950/60 text-white font-bold text-sm hover:bg-red-950/80 border border-red-800 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call 112 (Emergency)
            </a>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#B71C1C] flex items-center justify-center text-white shadow-xs">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Blood<span className="text-[#D32F2F]">Access</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/find" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.findBlood')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.becomeDonor')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors">
                  {t('faq.title')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Ethics */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <span className="text-xs text-gray-500 block leading-tight pt-1">
                  Compliant with Digital Personal Data Protection (DPDP) Act 2023 & NBTC voluntary donation guidelines.
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Misuse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Admin & Safety Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Strict Mandatory Disclaimer */}
        <div className="py-6 border-b border-gray-800 text-xs text-gray-400 leading-relaxed bg-gray-950/40 rounded-xl px-4 my-6">
          <p className="font-semibold text-gray-300 mb-1">
            {t('footer.disclaimer')}
          </p>
        </div>

        {/* Bottom copyright and love note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#D32F2F] fill-[#D32F2F]" /> for Indian voluntary blood donors.
          </p>
        </div>
      </div>
    </footer>
  )
}
