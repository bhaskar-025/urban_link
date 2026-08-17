import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MonoCard } from '../components/ui/MonoCard';
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  X, 
  Inbox, 
  Search, 
  Truck, 
  Archive, 
  Clock, 
  ShieldAlert, 
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api, { SOCKET_BASE_URL } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Complaint {
  _id: string;
  department: string;
  category?: string;
  title?: string;
  ticketId?: string;
  description?: string;
  status: string;
  priority: string;
  urgencyLevel?: string;
  administrativeWard?: string;
  createdAt: string;
  images?: string[];
  location: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    state?: string;
  };
}

interface LocationGroup {
  id: string;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  caseCount: number;
  departments: string[];
  priority: string;
  status: string;
  complaints: Complaint[];
}

const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
};

export const Dashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mapPoints, setMapPoints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<LocationGroup | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const uniqueLocations = useMemo(() => {
    const groups: Record<string, LocationGroup> = {};
    mapPoints.forEach((p) => {
      if (!p.location?.lat || !p.location?.lng) return;
      const key = `${p.location.lat.toFixed(5)},${p.location.lng.toFixed(5)}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          lat: p.location.lat,
          lng: p.location.lng,
          address: p.location.address || "Location in Ward",
          city: p.location.city,
          state: p.location.state,
          caseCount: 0,
          departments: [],
          priority: p.priority || 'Medium',
          status: p.status,
          complaints: [],
        };
      }
      groups[key].caseCount += 1;
      groups[key].complaints.push(p);
      if (!groups[key].departments.includes(p.department)) {
        groups[key].departments.push(p.department);
      }
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const currentOrder = (priorityOrder as any)[groups[key].priority] || 0;
      const newOrder = (priorityOrder as any)[p.priority] || 0;
      if (newOrder > currentOrder) groups[key].priority = p.priority;
    });
    return Object.values(groups);
  }, [mapPoints]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(Math.max(0, complaints.length - itemsPerPage), prev + 1));
  };

  useEffect(() => {
    if (currentIndex > complaints.length - itemsPerPage) {
      setCurrentIndex(Math.max(0, complaints.length - itemsPerPage));
    }
  }, [itemsPerPage, complaints.length, currentIndex]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [complaintsRes, mapRes] = await Promise.all([
          api.get('/complaints'),
          api.get('/complaints/map')
        ]);
        setComplaints(complaintsRes.data);
        setMapPoints(mapRes.data);
      } catch (e) {
        console.error("Dashboard DB fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 font-sans text-slate-900 bg-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            {t('dashboard.realtimeSync')}
          </p>
        </div>
        <Link to="/submit">
          <button className="bg-[#6032db] hover:bg-[#5024c9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
            <Plus size={14} />
            <span>{t('nav.submit')}</span>
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-[#f0f8fe] border border-sky-100/90 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <Inbox size={13} className="text-[#6032db]" /> {t('dashboard.total')}
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 m-0 font-display">
            {complaints.length}
          </p>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
            <Clock size={13} className="text-amber-600" /> {t('dashboard.pending')}
          </span>
          <p className="text-3xl font-extrabold text-amber-900 mt-2 m-0 font-display">
            {complaints.filter(c => c.status === 'Pending').length}
          </p>
        </div>

        {/* Investigating */}
        <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
            <Search size={13} className="text-sky-600" /> {t('dashboard.investigating')}
          </span>
          <p className="text-3xl font-extrabold text-sky-900 mt-2 m-0 font-display">
            {complaints.filter(c => c.status === 'Investigating').length}
          </p>
        </div>

        {/* Dispatched */}
        <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#6032db] flex items-center gap-1">
            <Truck size={13} className="text-[#6032db]" /> {t('dashboard.dispatched')}
          </span>
          <p className="text-3xl font-extrabold text-[#6032db] mt-2 m-0 font-display">
            {complaints.filter(c => c.status === 'Dispatched').length}
          </p>
        </div>

        {/* Resolved */}
        <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle size={13} className="text-emerald-600" /> {t('dashboard.resolved')}
          </span>
          <p className="text-3xl font-extrabold text-emerald-900 mt-2 m-0 font-display">
            {complaints.filter(c => c.status === 'Resolved').length}
          </p>
        </div>

        {/* Closed */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <Archive size={13} className="text-slate-500" /> {t('dashboard.closed')}
          </span>
          <p className="text-3xl font-extrabold text-slate-800 mt-2 m-0 font-display">
            {complaints.filter(c => c.status === 'Closed').length}
          </p>
        </div>
      </section>

      {/* Live Tracking Records Log */}
      <section className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 m-0">
              {t('dashboard.liveTracking')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0 || complaints.length === 0} 
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentIndex >= complaints.length - itemsPerPage || complaints.length === 0} 
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">
            {t('dashboard.syncing')}
          </div>
        ) : (
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
            >
              {complaints.length === 0 && (
                <div className="w-full py-12 text-center text-xs text-slate-400 italic">
                  {t('dashboard.noComplaints')}
                </div>
              )}
              {complaints.map((complaint: any) => {
                const isUrgent = ['Urgent', 'High', 'Critical'].includes(complaint.urgencyLevel || complaint.priority) && complaint.status !== 'Resolved';
                return (
                  <div key={complaint._id} style={{ flex: `0 0 ${100 / itemsPerPage}%` }} className="px-2 shrink-0 flex flex-col items-stretch h-auto">
                    <MonoCard
                      onClick={() => navigate(`/complaint/${complaint._id}`)}
                      className="flex flex-col h-full border border-slate-100 p-5 rounded-2xl cursor-pointer hover:border-purple-200 hover:shadow-lg transition-all bg-white"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            #{complaint.ticketId || complaint._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6032db] border border-purple-200">
                            {complaint.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-700">
                          <span>{complaint.category || complaint.department}</span>
                          {isUrgent && (
                            <span className="flex items-center text-rose-600">
                              <ShieldAlert size={13} />
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 leading-snug">
                          {complaint.title}
                        </h3>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-grow font-normal">
                          {complaint.description}
                        </p>

                        {complaint.images && complaint.images.length > 0 && (
                          <div className="w-full h-28 shrink-0 rounded-xl border border-slate-100 mb-4 overflow-hidden bg-slate-50 flex items-center justify-center relative group/img">
                            <img
                              src={complaint.images[0].startsWith('http') ? complaint.images[0] : `${SOCKET_BASE_URL}/${complaint.images[0].replace(/\\/g, '/')}`}
                              alt="Evidence"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenImage(complaint.images![0].startsWith('http') ? complaint.images![0] : `${SOCKET_BASE_URL}/${complaint.images![0].replace(/\\/g, '/')}`);
                              }}
                              className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Maximize size={12} />
                            </button>
                          </div>
                        )}

                        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                          <span className="truncate max-w-[55%]">{complaint.administrativeWard || 'Ward 1'}</span>
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </MonoCard>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Geospatial Map */}
      <section className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 flex flex-col justify-between h-[400px]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 m-0 mb-1">
                {t('dashboard.mapHeader')}
              </h2>
              <p className="text-xs text-slate-500 m-0 mb-4">
                {t('dashboard.mapSubtitle')}
              </p>
            </div>

            {/* Location list */}
            <div className="flex-grow border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden bg-slate-50/50">
              <div className="p-3 bg-white border-b border-slate-100 text-xs font-bold text-slate-800 flex justify-between items-center">
                <span>{t('dashboard.locationFeed')}</span>
                <span className="bg-[#6032db] text-white text-[10px] px-2 py-0.2 rounded-full">{uniqueLocations.length}</span>
              </div>
              <div className="flex-grow overflow-y-auto p-2 space-y-1 custom-scrollbar text-xs">
                {uniqueLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${activeLocation?.id === loc.id ? 'bg-[#6032db] text-white font-bold' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                    onMouseEnter={() => setActiveLocation(loc)}
                    onMouseLeave={() => setActiveLocation(null)}
                  >
                    <span className="truncate pr-2">{loc.address}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${activeLocation?.id === loc.id ? 'bg-white/20 text-white' : 'bg-purple-50 text-[#6032db]'}`}>
                      {loc.caseCount}
                    </span>
                  </div>
                ))}
                {uniqueLocations.length === 0 && (
                  <p className="text-slate-400 italic text-center py-8 text-xs m-0">{t('dashboard.noPoints')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Map canvas */}
          <div className="lg:col-span-2 h-[400px] w-full rounded-2xl border border-slate-200/80 overflow-hidden relative shadow-2xs">
            <MapContainer
              center={[21.1458, 79.0882]}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <MapController center={activeLocation ? [activeLocation.lat, activeLocation.lng] : null} />
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; <a href="https://maps.google.com/">Google</a>'
              />
              {uniqueLocations.map(loc => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  eventHandlers={{
                    mouseover: (e) => {
                      e.target.openPopup();
                      setActiveLocation(loc);
                    },
                    mouseout: (e) => {
                      e.target.closePopup();
                      setActiveLocation(null);
                    }
                  }}
                >
                  <Popup className="font-sans text-xs">
                    <div className="font-bold border-b border-slate-100 pb-1 mb-1 text-[#6032db]">
                      {loc.caseCount > 1 ? `${loc.caseCount} CASES DETECTED` : '1 CASE DETECTED'}
                    </div>
                    <div className="text-[10px] text-slate-600 mb-0.5">
                      Departments: {loc.departments.join(", ")}
                    </div>
                    {loc.address && (
                      <div className="text-[9px] text-slate-400 truncate max-w-[180px]">
                        {loc.address}
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
          >
            <X size={18} />
          </button>
          <img
            src={fullscreenImage}
            alt="Evidence"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
