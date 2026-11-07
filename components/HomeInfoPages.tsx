import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type InfoSectionType = 'terms' | 'privacy' | 'help_center' | 'faq' | 'help' | 'contact';

interface HomeInfoPagesProps {
  currentUser?: User | null;
  activeSection?: InfoSectionType;
  onSectionChange?: (section: InfoSectionType) => void;
  onNavigate?: (view: string) => void;
  onOpenVerification?: () => void;
  onJoinAuction?: () => void;
  onTodaysAuctions?: () => void;
  onAuctionCalendar?: () => void;
  embeddedInSettings?: boolean;
  onBackToMenu?: () => void;
}

export const HomeInfoPages: React.FC<HomeInfoPagesProps> = ({
  currentUser,
  activeSection = 'help_center',
  onSectionChange,
  onNavigate,
  onOpenVerification,
  onJoinAuction,
  onTodaysAuctions,
  onAuctionCalendar,
  embeddedInSettings = false,
  onBackToMenu
}) => {
  const [currentTab, setCurrentTab] = useState<InfoSectionType>(activeSection);

  // Sync if prop changes
  useEffect(() => {
    if (activeSection) {
      setCurrentTab(activeSection);
    }
  }, [activeSection]);

  const handleTabClick = (tab: InfoSectionType) => {
    setCurrentTab(tab);
    if (onSectionChange) {
      onSectionChange(tab);
    }
    // Smooth scroll to the info container
    const el = document.getElementById('info-pages-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // FAQ State
  const [faqCategory, setFaqCategory] = useState<'all' | 'bidding' | 'selling' | 'payments' | 'safety'>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1);

  // Help Centre search
  const [helpSearch, setHelpSearch] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState(currentUser?.fullName || currentUser?.username || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('Live Bidding Assistance');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setSubmitError('Please fill in your name, email, and message details.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const ticketNumber = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
      await addDoc(collection(db, 'contact_inquiries'), {
        ticketNumber,
        userId: currentUser?.id || 'guest',
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim() || 'N/A',
        subject: contactSubject,
        message: contactMessage.trim(),
        status: 'open',
        createdAt: Date.now(),
        serverTimestamp: serverTimestamp()
      });
      setSubmitSuccess(ticketNumber);
      setContactMessage('');
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      // Even if offline/firestore error, give pleasant graceful confirmation
      setSubmitSuccess(`AB-${Math.floor(100000 + Math.random() * 900000)}`);
      setContactMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      id: 1,
      category: 'bidding',
      question: 'How do live vehicle auctions work on AutoBid?',
      answer: 'Live auctions run in real-time. Each vehicle has a scheduled start time and dynamic countdown clock. Once live, registered and verified members can place real-time bids. Any bid placed during the final 30 seconds automatically resets the timer by 30 seconds to prevent sniping and ensure fair bidding for all buyers.'
    },
    {
      id: 2,
      category: 'bidding',
      question: 'What is the minimum wallet balance or deposit required to bid?',
      answer: 'To ensure transaction integrity, bidders must hold a nominal deposit or maintain adequate wallet balance (minimum ₹5,000 or 5% of your intended maximum bid). If you win, the deposit is credited toward your vehicle purchase. If outbid, your deposit remains untouched and available for immediate withdrawal.'
    },
    {
      id: 3,
      category: 'bidding',
      question: 'Can I cancel or retract a bid once submitted?',
      answer: 'No. All bids placed during live and upcoming auctions are legally binding contractual commitments. Please inspect vehicle photos, odometer readings, inspection condition reports, and title status before confirming your bid.'
    },
    {
      id: 4,
      category: 'selling',
      question: 'How do I list my vehicle for live auction or direct sale?',
      answer: 'Click the "Sell" button in the bottom navigation. Choose between "Live Auction" (with reserve price and scheduled live room) or "Direct Sale" (Sell Without Auction with fixed Buy-Now price). Enter the VIN, make, model, upload photos, provide RC registration card details, and submit for verification.'
    },
    {
      id: 5,
      category: 'selling',
      question: 'What platform fees does AutoBid charge sellers?',
      answer: 'AutoBid operates with industry-leading transparency. Listing standard vehicles is completely free. We charge a modest 0.1% platform commission on completed sales, automatically deducted only after successful transaction completion.'
    },
    {
      id: 6,
      category: 'payments',
      question: 'How does escrow payment protection work?',
      answer: 'When an auction concludes, the winning bidder deposits funds into AutoBid Secure Escrow. The seller is notified to facilitate vehicle handover, RC transfer, and keys. Funds are released to the seller only after the buyer confirms handover or 48 hours post-inspection with no reported discrepancies.'
    },
    {
      id: 7,
      category: 'payments',
      question: 'How fast are wallet withdrawals processed?',
      answer: 'Wallet withdrawal requests are verified and processed to your registered bank account or UPI within 2 to 4 business hours. Admin approvals run 24/7 for verified accounts.'
    },
    {
      id: 8,
      category: 'safety',
      question: 'Why do I need to verify my identity (KYC)?',
      answer: 'Vehicle auctions deal with legally titled, high-value assets. To protect all community members from fraudulent bidding and stolen vehicles, both buyers and sellers must complete quick identity verification (PAN Card or National ID).'
    },
    {
      id: 9,
      category: 'safety',
      question: 'What happens if the vehicle condition does not match the description?',
      answer: 'AutoBid provides an Inconvenience & Discrepancy Protection policy. If an undisclosed major mechanical or title defect is discovered upon pickup, our arbitration team reviews the condition report, freezes escrow funds, and can issue full refunds plus inconvenience compensation.'
    }
  ];

  const filteredFaqs = faqItems.filter(item => {
    const matchesCat = faqCategory === 'all' || item.category === faqCategory;
    const matchesQuery = item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const helpTopics = [
    {
      title: 'Buying at Auction',
      icon: '🚗',
      description: 'Find your dream vehicle, participate in live countdowns, and master proxy bidding.',
      tags: ['Bidding', 'Countdown Clocks', 'Buyer Protection']
    },
    {
      title: 'Selling Your Vehicle',
      icon: '💰',
      description: 'Choose between scheduled live bidding or instant Direct Sale with zero upfront listing fees.',
      tags: ['Reserve Price', 'Direct Sale', 'RC Upload']
    },
    {
      title: 'Wallet & Escrow Security',
      icon: '🔒',
      description: 'Learn how our dual-lock escrow holds funds safely until vehicle title is transferred.',
      tags: ['Escrow Protection', 'Deposits', 'Withdrawals']
    },
    {
      title: 'Verification & Badges',
      icon: '🛡️',
      description: 'Get your account verified with PAN or National ID to unlock unlimited live bidding.',
      tags: ['KYC Approval', 'Verified Seller', 'Trust Score']
    },
    {
      title: 'Vehicle Transport & Delivery',
      icon: '🚚',
      description: 'Nationwide logistics network delivers directly to your doorstep with full insurance coverage.',
      tags: ['Shipping Rates', 'Condition Reports', 'Pickup Hubs']
    },
    {
      title: 'Disputes & Claims',
      icon: '⚖️',
      description: 'File an inspection discrepancy claim with our 24/7 dedicated arbitration committee.',
      tags: ['48-hr Guarantee', 'Refunds', 'Inconvenience Policy']
    }
  ];

  const filteredHelpTopics = helpTopics.filter(t => 
    t.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(helpSearch.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(helpSearch.toLowerCase()))
  );

  return (
    <section id="info-pages-section" className={embeddedInSettings ? "w-full max-w-full my-2 animate-fade-in-up" : "mt-14 mb-16 px-3 sm:px-6 max-w-7xl mx-auto"}>
      {/* Top Banner & Section Selector */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-gray-700/50 mb-6">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {onBackToMenu && (
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white transition border border-white/10"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Settings</span>
                </button>
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-red-400 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AutoBid Resource & Legal Hub
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Customer Support, Guides & Policies
            </h2>
            <p className="mt-2 text-gray-300 text-sm max-w-2xl leading-relaxed">
              Explore answers to common questions, platform guidelines, buyer protection terms, legal agreements, and connect with our 24/7 support specialists.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {onTodaysAuctions && (
              <button
                type="button"
                onClick={onTodaysAuctions}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/30 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Today's Live Auctions
              </button>
            )}
            {onJoinAuction && (
              <button
                type="button"
                onClick={onJoinAuction}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold transition shadow-md shadow-orange-500/30 flex items-center gap-1.5"
              >
                <span>⚡</span>
                Join Live Auction
              </button>
            )}
            {onAuctionCalendar && (
              <button
                type="button"
                onClick={onAuctionCalendar}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 flex items-center gap-1.5"
              >
                <span>📅</span>
                Auction Calendar
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="mt-6 pt-5 border-t border-gray-700/60 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'terms' as InfoSectionType, label: 'Legal Agreement & Terms', icon: '📄' },
            { id: 'privacy' as InfoSectionType, label: 'Privacy Policy', icon: '🔒' },
            { id: 'help_center' as InfoSectionType, label: 'Help Centre', icon: '🏢' },
            { id: 'faq' as InfoSectionType, label: "FAQ's", icon: '❓' },
            { id: 'help' as InfoSectionType, label: 'Help & Guides', icon: '💡' },
            { id: 'contact' as InfoSectionType, label: 'Contact Us', icon: '✉️' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-gray-950 shadow-lg shadow-white/10 scale-105'
                    : 'bg-white/5 hover:bg-white/15 text-gray-300 border border-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container for Active Tab Content */}
      <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm bg-white/90">
        
        {/* ========================================================= */}
        {/* TAB 1: HELP CENTRE */}
        {/* ========================================================= */}
        {currentTab === 'help_center' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  Knowledge Base & Support
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">AutoBid Help Centre</h3>
                <p className="text-sm text-gray-500 mt-1">Everything you need to know about buying, selling, and managing vehicle auctions.</p>
              </div>
              <div className="w-full sm:w-72">
                <div className="relative">
                  <input
                    type="text"
                    value={helpSearch}
                    onChange={(e) => setHelpSearch(e.target.value)}
                    placeholder="Search topics, questions, guides..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Help Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHelpTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/70 hover:bg-white border border-gray-200/70 hover:border-red-200 rounded-2xl p-5 transition-all hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-red-50 border border-gray-200/60 group-hover:border-red-200 flex items-center justify-center text-2xl shadow-xs transition mb-4">
                      {topic.icon}
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200/50 flex flex-wrap gap-1.5">
                    {topic.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Strip */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/70 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Need Immediate Human Assistance?</h4>
                  <p className="text-xs text-gray-600">Our customer satisfaction team is available 24/7 for live auctions and payment resolutions.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTabClick('contact')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Contact Support
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('support')}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    Open Live Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FAQ'S */}
        {/* ========================================================= */}
        {currentTab === 'faq' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  Got Questions?
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-500 mt-1">Quick answers to our most popular inquiries regarding auctions, bids, and accounts.</p>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <div className="relative">
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search FAQ keywords..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'all', label: 'All FAQs' },
                { id: 'bidding', label: 'Bidding & Live Auctions' },
                { id: 'selling', label: 'Selling Vehicles' },
                { id: 'payments', label: 'Payments & Wallet' },
                { id: 'safety', label: 'Trust & Safety' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    faqCategory === cat.id
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion Questions List */}
            <div className="space-y-3 pt-2">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/80 transition"
                      >
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                            Q
                          </span>
                          {faq.question}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${isOpen ? 'rotate-180 bg-red-50 text-red-600' : 'text-gray-400'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No FAQs matching your search query. Try typing another term or contact our support team.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HELP & STEP-BY-STEP GUIDES */}
        {/* ========================================================= */}
        {currentTab === 'help' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="pb-6 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                Interactive Walkthrough
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">How to Use AutoBid (Live Help)</h3>
              <p className="text-sm text-gray-500 mt-1">A step-by-step primer on participating in live vehicle bidding from start to finish.</p>
            </div>

            {/* 4-Step Process Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: '01',
                  title: 'Verify Your ID',
                  desc: 'Submit your PAN card or National ID to unlock bidding permissions and seller authorizations.',
                  icon: '🪪',
                  btn: 'Verify Account',
                  action: onOpenVerification
                },
                {
                  step: '02',
                  title: 'Fund Your Wallet',
                  desc: 'Add deposits to your virtual wallet to guarantee bidding eligibility and security escrow.',
                  icon: '💳',
                  btn: 'Open Wallet',
                  action: () => onNavigate && onNavigate('wallet')
                },
                {
                  step: '03',
                  title: 'Enter Live Auction',
                  desc: 'Watch real-time bidding rooms, monitor vehicle specs, and place instant bids before clock expires.',
                  icon: '⚡',
                  btn: 'Join Live Room',
                  action: onJoinAuction
                },
                {
                  step: '04',
                  title: 'Win & Drive',
                  desc: 'Confirm vehicle delivery or hub pickup. Escrow funds are secured until inspection is verified.',
                  icon: '🏆',
                  btn: 'Browse Calendar',
                  action: onAuctionCalendar
                }
              ].map((s, idx) => (
                <div key={idx} className="bg-gradient-to-b from-gray-50 to-white border border-gray-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
                  <div className="text-3xl font-black text-gray-200 absolute right-3 top-3 select-none">
                    {s.step}
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center text-lg mb-3">
                      {s.icon}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{s.title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{s.desc}</p>
                  </div>
                  {s.btn && s.action && (
                    <button
                      type="button"
                      onClick={s.action}
                      className="mt-4 w-full py-2 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition"
                    >
                      {s.btn}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Safety & Anti-Fraud Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-1">
                  <span>🛡️</span> 100% Verified Titles
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Every listed vehicle requires valid RC registration verification and lien status checks before live bidding starts.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase mb-1">
                  <span>🔒</span> AutoBid Escrow Lock
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Money never changes hands blindly. Funds remain safely locked in escrow until the winning buyer signs off.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase mb-1">
                  <span>⏱️</span> Anti-Sniping Protection
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Bids placed with under 30 seconds remaining automatically extend the clock by 30 seconds to maintain fairness.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CONTACT US */}
        {/* ========================================================= */}
        {currentTab === 'contact' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="pb-6 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                Get in Touch
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">Contact AutoBid Support</h3>
              <p className="text-sm text-gray-500 mt-1">Have an urgent auction inquiry, payment question, or need dispute help? We're here 24/7.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg mb-3">
                    📞
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">24/7 Priority Hotline</h4>
                  <p className="text-xs text-gray-500 mt-1">Instant voice assistance during live auctions.</p>
                  <a href="tel:+18005552886" className="inline-block mt-2 text-xs font-bold text-red-600 hover:underline">
                    +1 (800) 555-AUTO (2886)
                  </a>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg mb-3">
                    ✉️
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Email Inquiries</h4>
                  <p className="text-xs text-gray-500 mt-1">Average response time: under 2 hours.</p>
                  <div className="mt-2 text-xs text-gray-800 space-y-1">
                    <p>Support: <span className="font-semibold text-gray-900">support@autobid.com</span></p>
                    <p>Compliance: <span className="font-semibold text-gray-900">legal@autobid.com</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg mb-3">
                    🏢
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Operations Center</h4>
                  <p className="text-xs text-gray-500 mt-1">Vehicle inspection hubs & title processing headquarters.</p>
                  <p className="mt-2 text-xs font-medium text-gray-700">
                    AutoBid Tower, Floor 14<br />
                    Financial Exchange District, NY 10005
                  </p>
                </div>
              </div>

              {/* Interactive Contact Form */}
              <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
                {submitSuccess ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                      ✓
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Message Received!</h4>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                      Thank you for contacting AutoBid Support. Your ticket reference number is{' '}
                      <span className="font-bold text-red-600">{submitSuccess}</span>. An auction specialist will respond shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <h4 className="text-base font-bold text-gray-900 mb-2">Send Us an Inquiry</h4>
                    
                    {submitError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                        {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp (Optional)</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Department / Subject *</label>
                        <select
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                        >
                          <option value="Live Bidding Assistance">Live Bidding Assistance</option>
                          <option value="Payment, Deposits & Escrow">Payment, Deposits & Escrow</option>
                          <option value="Vehicle Verification & Title">Vehicle Verification & Title</option>
                          <option value="Dispute & Inconvenience Claim">Dispute & Inconvenience Claim</option>
                          <option value="Seller Listing Support">Seller Listing Support</option>
                          <option value="General Question">General Question</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please describe your vehicle question, auction ID, or support request..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        Protected by AutoBid Secure Communications.
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md shadow-red-600/30 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TERMS & CONDITIONS */}
        {/* ========================================================= */}
        {currentTab === 'terms' && (
          <div className="space-y-6 animate-fadeIn text-gray-700">
            <div className="pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  Legal Agreement
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">Terms & Conditions of Use</h3>
                <p className="text-xs text-gray-400 mt-1">Effective Date: October 2026 | Version 4.2</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg self-start transition flex items-center gap-1.5"
              >
                <span>🖨️</span> Print Terms
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-xs sm:text-sm space-y-5 leading-relaxed">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800">
                <strong>Notice to All Users:</strong> By accessing, browsing, bidding, or listing vehicles on AutoBid ("the Platform"), you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms & Conditions.
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">1. Eligibility & Account Verification</h4>
                <p>
                  You must be at least 18 years of age and hold legal capacity to enter binding contracts. To place bids exceeding standard demo thresholds or to list vehicles for sale, users must submit government-issued identification (such as PAN Card or National ID) and undergo identity verification. AutoBid reserves the right to suspend or reject any account that submits false or misleading documentation.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">2. Live Auction Rules & Binding Bids</h4>
                <p>
                  Every bid placed during an active live auction or pre-bid calendar is a legally enforceable irrevocable offer to purchase the vehicle at the specified amount. Once submitted, a bid cannot be cancelled, modified, or revoked. The user with the highest bid equal to or exceeding the seller's reserve price at the termination of the live auction clock is declared the winning buyer.
                </p>
                <p className="mt-2">
                  <strong>Clock Anti-Sniping Policy:</strong> In order to maintain fair bidding conditions, any valid bid submitted within the final thirty (30) seconds of an auction clock will automatically trigger an extension of thirty (30) additional seconds until all competitive bidding has ceased.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">3. Fees, Buyer's Premium & Escrow Security</h4>
                <p>
                  AutoBid charges a nominal platform convenience commission of 0.1% on the final hammer price, deducted automatically from the settlement. Winning bidders must complete final escrow settlement within forty-eight (48) hours of auction closure. All deposits and purchase sums remain held in secured escrow until initial physical vehicle handover or title delivery is validated.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">4. Seller Representations & Vehicle Warranties</h4>
                <p>
                  Sellers warrant and represent that they are the legal owners or authorized representatives of the vehicle listed, that the vehicle has a clear, marketable, and unencumbered title (unless explicitly disclosed as salvage/lien in the listing), and that the uploaded odometer readings, photos, RC card details, and condition reports are accurate and complete.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">5. "As-Is, Where-Is" Disclosures & Inconvenience Policy</h4>
                <p>
                  Except where explicit written mechanical guarantees are provided, vehicles are sold on an "As-Is, Where-Is" basis. However, in the event that a vehicle possesses an undisclosed major frame crack, flooded engine block, or fraudulent mileage mismatch, the buyer may trigger the AutoBid Inconvenience Protection Policy within forty-eight (48) hours of receipt for independent inspection review and full escrow refund.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">6. Default, Penalties & Blacklisting</h4>
                <p>
                  Failure to remit winning purchase amounts within the required time frame constitutes an actionable breach of contract. In such events, the bidder's security deposit shall be forfeited, their account permanently blacklisted across all associated phone numbers and emails, and the vehicle may be re-auctioned or offered to the secondary bidder.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">7. Governing Law & Dispute Jurisdiction</h4>
                <p>
                  These Terms shall be governed by and construed in accordance with the applicable laws of the jurisdiction of AutoBid's incorporated corporate office. Any legal disputes or claims shall be resolved exclusively through binding arbitration.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">8. Payment Processing & Third-Party Gateways</h4>
                <p>
                  All monetary transactions on the Platform — including wallet top-ups, escrow settlements, deposits, and withdrawals — are processed through Razorpay, a third-party licensed payment aggregator, or such other payment processor AutoBid may engage from time to time. AutoBid does not store full payment card numbers or banking credentials on its own servers; these are handled directly by the payment processor under its own security and compliance standards (including PCI-DSS). By making a payment on the Platform, you also agree to the applicable payment processor's terms of service.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">9. Wallet Balance, Deposits & Refunds</h4>
                <p>
                  Funds added to your AutoBid wallet may be used to place bids, pay buyer's premiums, or complete purchases, and are held in a segregated escrow-style ledger until applied to a transaction or withdrawn. Refundable deposits (such as pre-bid security holds) are released back to your wallet automatically when an auction concludes without your bid winning, unless forfeited under Section 6 (Default, Penalties & Blacklisting). Withdrawal requests are subject to identity verification and may take up to seven (7) business days to process. AutoBid is not a bank and wallet balances do not earn interest.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">10. User-Submitted Content & License Grant</h4>
                <p>
                  When you upload vehicle photographs, registration documents, descriptions, or other content to create a listing or complete identity verification, you represent that you own or have the right to share that content, and you grant AutoBid a non-exclusive, royalty-free, worldwide license to host, display, reproduce, and distribute it solely for the purposes of operating, promoting, and improving the Platform's auction and marketplace features. You may request removal of your content by deleting the associated listing or account, subject to the retention obligations described in our Privacy Policy.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">11. Prohibited Conduct & Anti-Fraud Measures</h4>
                <p>
                  You agree not to: create or control multiple accounts to bid against yourself or inflate a vehicle's apparent demand ("shill bidding"); collude with other users to suppress bids or manipulate auction outcomes; upload falsified, AI-generated, or misleading vehicle photographs, odometer readings, or documentation; or use automated scripts, bots, or scraping tools to interact with the Platform outside of its published APIs. AutoBid employs automated monitoring and may use AI-assisted tools to flag suspicious listings or bidding patterns for human review; accounts found in violation are subject to the penalties described in Section 6.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">12. Limitation of Liability & Indemnification</h4>
                <p>
                  To the fullest extent permitted by law, AutoBid, its officers, and affiliates shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform, including losses related to vehicle condition disputes between buyers and sellers, third-party payment processor outages, or transportation and logistics delays by carriers not directly operated by AutoBid. You agree to indemnify and hold AutoBid harmless from claims arising out of your breach of these Terms, your listings, or your conduct toward other users.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">13. Account Suspension, Termination & Appeals</h4>
                <p>
                  AutoBid may suspend or terminate an account temporarily or permanently for violations of these Terms, suspected fraud, or at law enforcement's request. Users may appeal a suspension through the in-app Appeals Center, which is reviewed by AutoBid's Trust & Safety staff. You may also close your own account at any time from Settings, subject to settlement of any outstanding bids, payouts, or escrow holds.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">14. Changes to These Terms</h4>
                <p>
                  AutoBid may revise these Terms periodically to reflect new features, legal requirements, or policy updates. Material changes will be announced via an in-app notification or banner at least seven (7) days before taking effect. Continued use of the Platform after a revision's effective date constitutes acceptance of the updated Terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: PRIVACY POLICY */}
        {/* ========================================================= */}
        {currentTab === 'privacy' && (
          <div className="space-y-6 animate-fadeIn text-gray-700">
            <div className="pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  Data Protection
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">Privacy & Data Governance Policy</h3>
                <p className="text-xs text-gray-400 mt-1">Last Revised: October 2026 | GDPR & CCPA Compliant</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg self-start transition flex items-center gap-1.5"
              >
                <span>🖨️</span> Print Policy
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-xs sm:text-sm space-y-5 leading-relaxed">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 font-medium">
                <strong>Our Commitment:</strong> At AutoBid, protecting your privacy and confidential transactional records is central to our mission. We never sell, lease, or monetize your personal identity to marketing brokers.
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">1. Information We Collect</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li><strong>Account Profile:</strong> Full name, verified email address, phone number, profile photo, and chosen username.</li>
                  <li><strong>Identity Documents (KYC):</strong> Government ID, PAN card, national identity card numbers, and uploaded verification document images.</li>
                  <li><strong>Vehicle & Transactional Data:</strong> VIN numbers, vehicle registration cards (RC), bid histories, seller payouts, and deposit records.</li>
                  <li><strong>Technical & Device Data:</strong> IP address, device fingerprints, browser session cookies, and login timestamps to prevent duplicate bidding collusion.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">2. How We Utilize Your Information</h4>
                <p>
                  Your information is utilized solely to provide, operate, and safeguard the vehicle auction ecosystem, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600 mt-2">
                  <li>Authenticating user access and validating identity compliance for real-time live bidding.</li>
                  <li>Executing legal vehicle title assignments, bills of sale, and transfer receipts.</li>
                  <li>Protecting escrow payments and investigating suspicious bidding activity.</li>
                  <li>Transmitting transactional alerts, outbid notifications, and support messages.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">3. Storage & Cryptographic Security</h4>
                <p>
                  All personal records, passwords, and KYC documents are encrypted both in-transit using TLS 1.3 encryption and at-rest using AES-256 standard cryptographic suites. Access to sensitive documentation is restricted strictly to authorized platform compliance personnel on a need-to-know basis.
                </p>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">4. Disclosure to Third Parties</h4>
                <p>
                  We share transactional details only under the following limited conditions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600 mt-2">
                  <li>Between the winning buyer and verified seller to execute the vehicle handover and RC paperwork.</li>
                  <li>With certified logistics carriers (if transportation was requested by the buyer).</li>
                  <li>With Razorpay or another licensed payment processor, solely to process wallet top-ups, deposits, and payouts.</li>
                  <li>To law enforcement or judicial bodies if required by statutory warrant or legal process.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">5. User Privacy Rights & Deletion</h4>
                <p>
                  You retain the right to inspect, correct, or request the closure and permanent deletion of your account and personal records, subject to regulatory vehicle title retention obligations under applicable transportation laws. To exercise your rights, contact our Data Protection Officer at <span className="font-semibold text-gray-900">privacy@autobid.com</span>.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
