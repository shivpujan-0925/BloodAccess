import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import FindBloodPage from './pages/FindBloodPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import ContactPage from './pages/ContactPage'
import { ArrowLeft, Clock } from 'lucide-react'

// Lightweight placeholder for pages to be built in subsequent phases
function ComingSoonPage({ title }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FBEFEF] text-[#D32F2F] flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mb-2">{title}</h2>
        <p className="text-sm text-[#616161] mb-6">
          This page is scheduled for the next development phase per the SPEC.md build order.
        </p>
        <Link
          to="/"
          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D32F2F] text-white font-semibold text-sm hover:bg-[#B71C1C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/find" element={<FindBloodPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<ComingSoonPage title="Page in Development" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
