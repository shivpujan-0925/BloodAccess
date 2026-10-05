import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Droplet, Menu, X, Globe, UserCheck, Search, HelpCircle, LogIn } from 'lucide-react'

export default function Header() {
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentLang = i18n.language || 'en'
  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith('hi') ? 'en' : 'hi'
    i18n.changeLanguage(nextLang)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-decoration-none group py-2"
            aria-label="BloodAccess Home"
          >
            <div className="w-10 h-10 rounded-full bg-[#FBEFEF] flex items-center justify-center text-[#D32F2F] group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <Droplet className="w-6 h-6 fill-[#D32F2F] text-[#D32F2F]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222] font-sans">
                Blood<span className="text-[#D32F2F]">Access</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#616161] -mt-1 hidden sm:block">
                Voluntary Donor Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/find"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#222222] hover:text-[#D32F2F] hover:bg-[#FBEFEF] transition-colors"
            >
              <Search className="w-4 h-4 text-[#D32F2F]" />
              {t('nav.findBlood')}
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#222222] hover:text-[#D32F2F] hover:bg-[#FBEFEF] transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#2E7D32]" />
              {t('nav.becomeDonor')}
            </Link>

            <Link
              to="/how-it-works"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[#222222] hover:text-[#D32F2F] hover:bg-[#FBEFEF] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#616161]" />
              {t('nav.howItWorks')}
            </Link>
          </nav>

          {/* Desktop Right Actions: Language Toggle & Login */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="tap-target inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#222222] bg-gray-50 hover:bg-[#FBEFEF] hover:text-[#D32F2F] border border-gray-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
              title="Switch language / भाषा बदलें"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-[#D32F2F]" />
              <span className="font-semibold text-xs tracking-wide">
                {currentLang.startsWith('hi') ? 'English' : 'हिन्दी'}
              </span>
            </button>

            {/* Login button */}
            <Link
              to="/login"
              className="tap-target inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-xl shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </Link>
          </div>

          {/* Mobile Right Controls: Language toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              type="button"
              className="tap-target inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#222222] bg-[#FBEFEF] text-[#D32F2F] border border-red-100 rounded-lg cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.startsWith('hi') ? 'EN' : 'हिं'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="tap-target p-2 rounded-lg text-[#222222] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
          <Link
            to="/find"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-[#222222] hover:bg-[#FBEFEF] hover:text-[#D32F2F]"
          >
            <Search className="w-5 h-5 text-[#D32F2F]" />
            {t('nav.findBlood')}
          </Link>

          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-[#222222] hover:bg-[#FBEFEF] hover:text-[#D32F2F]"
          >
            <UserCheck className="w-5 h-5 text-[#2E7D32]" />
            {t('nav.becomeDonor')}
          </Link>

          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-[#222222] hover:bg-[#FBEFEF] hover:text-[#D32F2F]"
          >
            <HelpCircle className="w-5 h-5 text-[#616161]" />
            {t('nav.howItWorks')}
          </Link>

          <div className="pt-2 border-t border-gray-100">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="tap-target w-full flex items-center justify-center gap-2 py-3 text-base font-semibold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-xl shadow-xs"
            >
              <LogIn className="w-5 h-5" />
              {t('nav.login')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
