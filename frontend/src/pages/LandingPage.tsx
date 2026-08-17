import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageCircle,
  Sparkles,
  Compass,
  Droplets,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CIVIC_CATEGORIES = [
  {
    icon: Compass,
    name: 'Roads & Potholes',
    desc: 'Asphalt craters, damaged curbs & missing manhole covers.'
  },
  {
    icon: Droplets,
    name: 'Water & Drainage',
    desc: 'Pipeline leaks, sewage overflows & urban waterlogging.'
  },
  {
    icon: Lightbulb,
    name: 'Streetlights & Power',
    desc: 'Dark public stretches, power outages & exposed cables.'
  },
  {
    icon: Trash2,
    name: 'Waste & Sanitation',
    desc: 'Overflowing dumpsters, garbage piles & illegal dumping.'
  }
];

export const LandingPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalComplaints: 0, resolvedComplaints: 0, totalAdmins: 0 });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {});

    api.get('/complaints')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRecentComplaints(res.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dispatched':
        return 'bg-[#6032db] text-white border-transparent';
      case 'Investigating':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const defaultFeed = [
    { ticketId: 'TK-8921', ward: 'Ward 4', title: 'Water Pipeline Rupture', status: 'Dispatched' },
    { ticketId: 'TK-8919', ward: 'Ward 2', title: 'Streetlight Maintenance', status: 'Resolved' },
    { ticketId: 'TK-8915', ward: 'Ward 7', title: 'Pothole Patching Required', status: 'Investigating' },
  ];

  const displayFeed = recentComplaints.length > 0
    ? recentComplaints.map(c => ({
        ticketId: c.ticketId || c._id.slice(-6).toUpperCase(),
        ward: c.administrativeWard || 'Ward 1',
        title: c.title,
        status: c.status
      }))
    : defaultFeed;

  return (
    <div className="flex flex-col w-full bg-white text-slate-900 font-sans pb-20">
      
      {/* 1. HERO SECTION (BrandSurge Sky-Blue Tint) */}
      <section className="w-full bg-gradient-to-b from-[#e2f3fd] via-[#edf7fe] to-white py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Column Text */}
          <div className="max-w-xl flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-sky-200/80 text-xs font-bold text-[#6032db] shadow-2xs mb-4">
              <Sparkles size={14} />
              <span>Smart Civic Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] m-0">
              Intelligent urban <br />
              <span className="text-[#6032db]">complaint routing.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mt-4 mb-8 max-w-lg">
              Report potholes, streetlights, water leaks, and waste in seconds. AI instantly verifies and dispatches municipal crews with end-to-end transparency.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/register">
                <button className="bg-[#6032db] hover:bg-[#5024c9] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6032db]/25 cursor-pointer flex items-center gap-2 active:scale-95">
                  <span>Report an Issue</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
              <Link to="/issues">
                <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs">
                  Explore Live Map
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column Visual Banner - Live Complaints List */}
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-sky-900/5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Complaints Register</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Radar
              </span>
            </div>

            <div className="space-y-3">
              {displayFeed.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${idx === 0 ? 'bg-[#f0f8fe] border-sky-100/90' : 'bg-white border-slate-100 shadow-2xs'}`}
                >
                  <div className="text-left max-w-[65%]">
                    <span className="text-[10px] font-bold text-[#6032db] uppercase">
                      #{item.ticketId} • {item.ward}
                    </span>
                    <p className="text-xs font-bold text-slate-900 m-0 truncate">
                      {item.title}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CIVIC ISSUE CATEGORIES (Replacing duplicate feature cards with actionable categories) */}
      <section className="max-w-6xl w-full mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CIVIC_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={i} 
                to="/submit"
                className="bg-[#f0f8fe] border border-sky-100/90 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all hover:bg-white hover:shadow-md hover:border-sky-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-[#6032db] group-hover:bg-[#6032db] group-hover:text-white flex items-center justify-center mb-3 shadow-2xs transition-colors">
                  <Icon size={20} className="stroke-[1.75]" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-[11px] text-slate-500 leading-normal m-0 font-normal">{cat.desc}</p>
                <span className="text-[10px] font-bold text-[#6032db] mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Report Issue <ArrowRight size={10} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. DYNAMIC METRICS / STATISTICS SECTION */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16">
        <div className="p-8 rounded-3xl bg-[#f8fafd] border border-slate-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-none font-display">
                {stats.totalComplaints.toLocaleString()}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                {t('landing.complaintsRaised')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-4xl lg:text-5xl font-extrabold text-[#6032db] leading-none font-display">
                {stats.totalAdmins.toLocaleString()}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                {t('landing.adminOfficials')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-none font-display">
                {stats.resolvedComplaints.toLocaleString()}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">
                {t('landing.complaintsResolved')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PHASE CARDS SECTION ("How CitySync works for your city") */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
              How CitySync works for your city
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 m-0">
              From observation to verified on-ground repair in three seamless phases.
            </p>
          </div>
          <Link to="/submit">
            <button className="bg-[#6032db] hover:bg-[#5024c9] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <span>Submit Issue</span>
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Phase 1 */}
          <div className="bg-[#eaf4fd] rounded-3xl p-7 border border-sky-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white text-[#6032db] flex items-center justify-center mb-4 shadow-2xs font-bold text-xs">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('landing.p1Title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal m-0">
                {t('landing.p1Desc')}
              </p>
            </div>
          </div>

          {/* Phase 2 (Royal Purple Card) */}
          <div className="bg-[#6032db] text-white rounded-3xl p-7 flex flex-col justify-between shadow-lg shadow-[#6032db]/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 font-bold text-xs">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('landing.p2Title')}
              </h3>
              <p className="text-xs text-purple-100 leading-relaxed font-normal m-0">
                {t('landing.p2Desc')}
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-[#eaf4fd] rounded-3xl p-7 border border-sky-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white text-[#6032db] flex items-center justify-center mb-4 shadow-2xs font-bold text-xs">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('landing.p3Title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal m-0">
                {t('landing.p3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP & SMS SECTION */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16">
        <div className="border border-slate-200/80 rounded-3xl p-8 bg-white flex flex-col sm:flex-row gap-6 items-start shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <MessageCircle size={26} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 m-0">
              {t('landing.whatsappTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal m-0">
              {t('landing.whatsappDesc')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
