import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, CheckCircle, Zap, Shield, Download,
  Mail, BarChart3, Users, FileText, Receipt, Star,
  Clock, TrendingUp, ChevronDown, Sparkles, Menu, X
} from 'lucide-react'
import heroImage from '../assets/hero.jpg'

// ── Animated counter ─────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef()
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let s = 0
        const step = end / 80
        const t = setInterval(() => {
          s += step
          if (s >= end) { setCount(end); clearInterval(t) }
          else setCount(Math.floor(s))
        }, 20)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

function DoodleArrow({ className = '', style = {} }) {
  return (
    <svg className={className} style={style} width="60" height="40" viewBox="0 0 60 40" fill="none">
      <path d="M4 20 Q20 4 44 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="4 2"/>
      <path d="M38 12 L46 20 L36 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function Squiggle({ color = '#6D28D9' }) {
  return (
    <svg width="100%" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
      <path d="M0 6 Q25 0 50 6 Q75 12 100 6 Q125 0 150 6 Q175 12 200 6" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close menu on route change or outside click
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const faqs = [
    { q: 'Is Billit really free?', a: 'Yes, completely free. No credit card, no hidden charges, no "upgrade to unlock" walls. Build your invoicing workflow without spending a kobo.' },
    { q: 'Can I invoice in Naira?', a: 'Absolutely. Billit supports NGN (₦), USD ($), GBP (£), EUR (€), and CAD. Switch currencies per invoice — great if you bill both local and international clients.' },
    { q: 'How does the receipt work?', a: 'When you mark an invoice as paid, Billit automatically creates a receipt with its own number. It captures a frozen snapshot of the invoice so your records are always accurate.' },
    { q: 'Can I send invoices by email?', a: 'Yes. Hit "Email Invoice" on any invoice and it goes straight to your client\'s inbox with a clean HTML email and a full summary.' },
    { q: 'Is my financial data safe?', a: 'Your data is stored with Row Level Security — meaning only YOU can see your invoices. No other user can ever access your financial records.' },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden p-8" style={{ background: '#F5F6FA', fontFamily: 'Nunito Sans, sans-serif' }}>

      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee { animation: marquee 28s linear infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 3.5s ease-in-out infinite; }
        .float2 { animation: float 3.5s ease-in-out infinite 0.8s; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 12s linear infinite; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.10); }
        .btn-bounce:hover { transform: scale(1.03); }
        .btn-bounce:active { transform: scale(0.97); }
        .btn-bounce { transition: transform 0.15s ease; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .menu-slide { animation: slideDown 0.2s ease forwards; }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-black/5' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="#" style={{ textDecoration: 'none' }}>
              <h1 className="text-xl font-black text-[#0F1117]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                Bill<span style={{ color: '#6D28D9' }}>it</span>
              </h1>
            </a>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g,'-')}`}
                className="text-sm font-semibold text-[#5C6070] hover:text-[#0F1117] transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/auth')}
              className="text-sm font-bold text-[#5C6070] hover:text-[#0F1117] transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/auth')}
              className="btn-bounce flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: '#0F1117' }}>
              Get Started Free <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#E4E7EE] bg-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} color="#0F1117" /> : <Menu size={18} color="#0F1117" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden menu-slide bg-white border-t border-[#E4E7EE] px-6 py-6 flex flex-col gap-5">
            {['Features', 'How it works', 'FAQ'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g,'-')}`}
                className="text-base font-bold text-[#0F1117]"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="border-t border-[#E4E7EE] pt-4 flex flex-col gap-3">
              <button
                onClick={() => { navigate('/auth'); setMenuOpen(false) }}
                className="w-full py-3 rounded-xl text-base font-bold text-[#0F1117] border border-[#E4E7EE]"
              >
                Log in
              </button>
              <button
                onClick={() => { navigate('/auth'); setMenuOpen(false) }}
                className="btn-bounce w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-black text-white"
                style={{ background: '#0F1117' }}
              >
                Get Started Free <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative " style={{ background: '#F5F6FA' }}>
        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #CBD0DB 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }} />

        <div className="max-w-6xl py-24 mx-auto relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-[#6D28D9]/10 rounded-full px-5 py-2">
              <Sparkles size={13} style={{ color: '#0F1117' }} />
              <span className="text-[12px] flex font-black text-[#0F1117]">Built for creatives and business owners ✦</span>
            </div>
          </div>

          {/* Big headline */}
          <div className="text-center mb-16 lg:mb-8">
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-semibold text-[#0F1117] leading-[0.95] mb-8 lg:mb-4"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}
            >
              Invoice. Track.
              <br />
              <span className="relative inline-block" style={{ color: '#6D28D9' }}>
                Get paid.
                <span className="absolute -bottom-1 left-0 w-full"><Squiggle color="#6D28D9" /></span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#5C6070] max-w-lg mx-auto leading-relaxed font-medium mt-4">
              Create professional invoices in 2 minutes. Get auto-receipts when paid. Made for freelancers, creators, vendors & small businesses.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button onClick={() => navigate('/auth')}
              className="btn-bounce flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white border border-[#0F1117]"
              style={{ background: '#0F1117' }}>
              Create my first invoice — free
              <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/auth')}
              className="btn-bounce flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-[#0F1117] bg-white border border-[#0F1117]">
              Log in
            </button>
          </div>

          {/* Trust row */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-2 mb-12">
            {[
              { icon: CheckCircle, text: 'No credit card required' },
              { icon: Zap, text: '2-minute setup' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} style={{ color: '#16A34A' }} />
                <span className="text-[12px] font-regular text-[#5C6070]">{text}</span>
              </div>
            ))}
          </div>

          {/* Hero visual — hidden on mobile */}
          <div className=" max-w-2xl lg:max-w-4xl mx-auto">
            {/* Main invoice card */}
             <img
    src={heroImage}
    alt="Billit invoice dashboard"
    className="w-full rounded-3xl"
  />
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div className=" bg-[#FFFFFF] py-4 overflow-hidden">
        <div className="flex gap-8 marquee whitespace-nowrap">
          {[...Array(3)].map((_, r) =>
            ['Designers', 'Developers', 'Photographers', 'Copywriters', 'Video Editors', 'Social Media', 'Small Businesses', 'Music Producers'].map((item, i) => (
              <div key={`${r}-${i}`} className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-[#0F1117]">{item}</span>
                <span className="text-[#0F1117] opacity-40 font-black">✦</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── BENTO FEATURES ──────────────────────────────────── */}
      <section id="features" className="py-24" style={{ background: '#F5F6FA' }}>
        <div className="max-w-6xl mx-auto style={{ background: '#F5F6FA' }}">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-[#6D28D9] uppercase tracking-widest mb-2">✦ Features ✦</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#0F1117]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              Invoices. Receipts.
              <br />
              <span className="relative inline-block">
                And more.
                <span className="absolute -bottom-1 left-0 w-full"><Squiggle color="#6D28D9" /></span>
              </span>
            </h2>
          </div>

          {/* Bento grid — single column on mobile, grid on md+ */}
          <div className="flex flex-col sm:col-span-8 lg:grid lg:grid-cols-12 gap-8 lg:gap-4">

            {/* Big feature — Invoice */}
            <div className="md:col-span-8 bg-[#ffffff] rounded-3xl p-6 sm:p-8 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#6D28D9] flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <span className="bg-[#6828d9]/10 rounded-full px-3 py-1 text-xs font-black text-[#0F1117]">Most used</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Invoice in 2 minutes</h3>
              <p className="text-[#0F1117]/70 font-medium leading-relaxed max-w-md text-sm sm:text-base">
                Fill in your client, add what you did, set a price. Billit handles the math, the numbering, and the paper trail. Done in under 2 minutes.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Auto-numbering', 'Live totals', 'Saved clients', 'Tax calculation', 'Multi-currency'].map(tag => (
                  <span key={tag} className="bg-[#6d28d9]/10 rounded-full px-3 py-1 text-xs font-black text-[#0F1117]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Auto receipts */}
            <div className="md:col-span-4 bg-[#ffffff] rounded-3xl p-6 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] flex items-center justify-center mb-3">
                <Receipt size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Auto receipts</h3>
              <p className="text-sm text-[#0F1117]/70 font-medium leading-relaxed">
                Mark paid → receipt generated instantly. Numbered, stored, PDF-ready. Zero extra clicks.
              </p>
            </div>

            {/* PDF Export */}
            <div className="md:col-span-4 bg-[#ffffff] rounded-3xl p-6 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] flex items-center justify-center mb-3">
                <Download size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>PDF export</h3>
              <p className="text-sm text-[#0F1117]/70 font-medium leading-relaxed">
                Clean A4 PDFs of every invoice and receipt. Professional on every device.
              </p>
            </div>

            {/* Email */}
            <div className="md:col-span-4 bg-[#ffffff] rounded-3xl p-6 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] flex items-center justify-center mb-3">
                <Mail size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Email to client</h3>
              <p className="text-sm text-[#0F1117]/70 font-medium leading-relaxed">
                One click sends a branded email straight to your client's inbox.
              </p>
            </div>

            {/* Dashboard */}
            <div className="md:col-span-4 bg-[#ffffff] rounded-3xl p-6 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] flex items-center justify-center mb-3">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Dashboard analytics</h3>
              <p className="text-sm text-[#0F1117]/70 font-medium leading-relaxed">
                See receivables, overdue amounts, and monthly revenue. Know your numbers.
              </p>
            </div>

            {/* Who it's for */}
            <div className="md:col-span-8 bg-[#ffffff] rounded-3xl p-6 sm:p-8 card-hover relative overflow-hidden">
              <h3 className="text-xl sm:text-2xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Built for all kinds of creatives ✦
              </h3>
              <p className="text-[#0F1117]/70 font-medium mb-4 text-sm sm:text-base">
                Whether you're a designer, developer, photographer, or running a small business, Billit speaks your language.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['Designers', 'Developers', 'Photographers', 'Small Businesses', 'Copywriters', 'Video Editors'].map(p => (
                  <span key={p} className="bg-[#6d28d9]/20 rounded-full px-3 py-1 text-xs font-black text-[#0F1117]">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="md:col-span-4 bg-[#ffffff] rounded-3xl p-6 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] flex items-center justify-center mb-3">
                <Shield size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Private & secure</h3>
              <p className="text-sm text-[#0F1117]/70 font-medium leading-relaxed">
                Row Level Security means only YOU see your financial records. Always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" style={{ background: '#F5F6FA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-[#6D28D9] uppercase tracking-widest mb-2">✦ How it works ✦</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#0F1117]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              Signup to paid
              <br />in 4 steps.
            </h2>
          </div>

          {/* Single column on mobile, 4 columns on large screens */}
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { step: '01', title: 'Create account', desc: 'Sign up free with your email. No card, no delay, no nonsense.', bg: '#FFFFFF', accent: '#8B5CF6' },
              { step: '02', title: 'Set up profile', desc: 'Add business name and details. Shows on every invoice automatically.', bg: '#FFFFFF', accent: '#8B5CF6' },
              { step: '03', title: 'Create invoice', desc: 'Add client, items, amounts. Totals calculate live as you type.', bg: '#FFFFFF', accent: '#8B5CF6' },
              { step: '04', title: 'Get paid', desc: 'Mark as paid when money arrives. Receipt generated instantly.', bg: '#FFFFFF', accent: '#8B5CF6' },
            ].map(({ step, title, desc, bg, accent }, i) => (
              <div key={step} className="relative">
                {i < 3 && (
                  ""
                )}
                <div className="border border-[#FFFFFF] rounded-3xl p-6 h-full card-hover" style={{ background: bg }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: accent }}>
                    <span className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F1117] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
                  <p className="text-sm text-[#0F1117]/90 font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button onClick={() => navigate('/auth')}
              className="btn-bounce w-1/3 justify-center flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white"
              style={{ background: '#0F1117' }}>
              Start now — free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#F5F6FA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-[#6D28D9] uppercase tracking-widest mb-2">✦ Reviews ✦</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#0F1117]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              Real people.
              <br />Real results.
            </h2>
          </div>

          {/* Single column on mobile, 3 columns on md+ */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-4">
            {[
              { name: 'Tolu Adeyemi', role: 'Brand Designer · Lagos', text: 'I used to send invoices on WhatsApp as screenshots. Billit makes me look 10x more professional. My clients actually pay on time now.', avatar: 'T', bg: '#EDE9FE', accent: '#6D28D9' },
              { name: 'Emeka Okafor', role: 'Fullstack Dev · Abuja', text: 'The auto receipt is a game changer. I used to forget to send receipts for weeks. Now the moment I mark paid, the receipt is already there waiting.', avatar: 'E', bg: '#F0FDF4', accent: '#16A34A' },
              { name: 'Amara Nwosu', role: 'Content Creator · PH', text: 'Finally a billing tool in Naira that doesn\'t feel built for a Fortune 500 company. The dashboard actually makes sense to me as a non-accountant.', avatar: 'A', bg: '#F5F3FF', accent: '#8B5CF6' },
            ].map(({ name, role, text, avatar, bg, accent }) => (
              <div key={name} className="bg-white rounded-3xl p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" stroke="none" />)}
                </div>
                <p className="text-sm text-[#5C6070] font-medium leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: bg }}>
                    <span className="text-sm font-black" style={{ color: accent }}>{avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0F1117]">{name}</p>
                    <p className="text-xs text-[#5C6070] font-semibold">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ background: '#F5F6FA' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-[#6D28D9] uppercase tracking-widest mb-2">✦ FAQ ✦</p>
            <h2 className="text-4xl sm:text-5xl font-semibold text-[#0F1117]" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
              Quick answers.
            </h2>
          </div>
          <div className="space-y-6 lg:space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: openFaq === i ? '1px 1px 0px #6D28D9' : '' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FAFAFA] transition-colors">
                  <span className="font-medium text-[#0F1117] text-sm pr-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{faq.q}</span>
                  <ChevronDown size={16} className="text-[#5C6070] shrink-0 transition-transform duration-300"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 border-t border-[#E4E7EE]">
                    <p className="text-sm text-[#0F1117] font-regular leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#0F1117] border border-[#0F1117] rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute top-6 right-6 w-16 h-16 sm:w-20 sm:h-20 spin-slow">
              <div className="w-full h-full rounded-full border-2 border-[#FFFFFF] border-dashed flex items-center justify-center">
                <span className="text-[#FFFFFF] text-[9px] sm:text-xs font-black text-center leading-tight">FREE<br />FOREVER</span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#0F1117] rounded-full px-5 py-2 mb-6">
                <Sparkles size={13} className="text-[#0F1117]" />
                <span className="text-xs font-black text-[#0F1117]">No credit card required</span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-[1.05]"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
                Your creative work
                <br />
                <span style={{ color: '#6D28D9' }}>deserves to be paid.</span>
              </h2>

              <p className="text-white/80 mb-8 max-w-md mx-auto font-regular text-sm sm:text-base">
                Join freelancers and small businesses getting paid faster with Billit.
              </p>

              <button onClick={() => navigate('/auth')}
                className="btn-bounce inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-black text-white border border-[#6D28D9]"
                style={{ background: '#6D28D9' }}>
                Start billing for free
                <ArrowRight size={18} />
              </button>

              <p className="text-white/70 text-xs mt-5 font-semibold">
                Takes 2 minutes · No card needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t-2 border-[#0F1117] py-10 px-6 bg-[#0f1117]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <h1 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Billit
            </h1>
            <p className="text-sm text-white/50 font-medium max-w-xs">
              Professional invoicing for freelancers, creators and small businesses.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2">
                {['Features', 'How it works', 'FAQ'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s/g,'-')}`}
                    className="block text-sm text-white/50 hover:text-white/80 font-semibold transition-colors">
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider mb-3">Account</p>
              <div className="space-y-2">
                {['Sign Up', 'Log In'].map(item => (
                  <button key={item} onClick={() => navigate('/auth')}
                    className="block text-sm text-white/50 hover:text-white/80 font-semibold transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-white/60 font-semibold">© 2026 Billit. All rights reserved.</p>
          <div className="flex gap-1">
            {['✦', '✦', '✦'].map((s, i) => <span key={i} style={{ color: '#FFFFFF', fontSize: 10 }}>{s}</span>)}
          </div>
        </div>
      </footer>
    </div>
  )
}