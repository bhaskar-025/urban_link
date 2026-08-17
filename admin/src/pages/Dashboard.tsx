import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ChevronRight, 
  TrendingUp, 
  Inbox, 
  Search, 
  Truck, 
  Archive, 
  Flame, 
  MapPin, 
  Clock, 
  BarChart3 
} from 'lucide-react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Complaint {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  department: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

export const Dashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [complaintsRes, analyticsRes] = await Promise.all([
          api.get('/admin/complaints'),
          api.get('/admin/analytics')
        ]);
        setComplaints(complaintsRes.data);
        setAnalytics(analyticsRes.data.map((d: any) => ({ date: d._id, count: d.count })));
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const total = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const investigatingCount = complaints.filter(c => c.status === 'Investigating').length;
  const dispatchedCount = complaints.filter(c => c.status === 'Dispatched').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <div className="w-10 h-10 border-4 border-[#6032db]/20 border-t-[#6032db] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Municipal Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Real-time civic intelligence, dispatch tracking, and analytics.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Telemetry Active</span>
        </div>
      </div>

      {/* 1. KPI / Stat Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Inbox size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 leading-none">{total}</p>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">All logged issues</span>
        </div>

        {/* Pending */}
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-600 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 leading-none">{pendingCount}</p>
          <span className="text-[10px] text-amber-700/70 mt-2 block font-medium">Awaiting assignment</span>
        </div>

        {/* Investigating */}
        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-sky-600 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Investigating</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Search size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-sky-600 leading-none">{investigatingCount}</p>
          <span className="text-[10px] text-sky-700/70 mt-2 block font-medium">Field inspection active</span>
        </div>

        {/* Dispatched */}
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[#6032db] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dispatched</span>
            <div className="w-7 h-7 rounded-lg bg-[#f3effe] text-[#6032db] flex items-center justify-center">
              <Truck size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#6032db] leading-none">{dispatchedCount}</p>
          <span className="text-[10px] text-[#6032db]/70 mt-2 block font-medium">Crews on-site</span>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 leading-none">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-700/70 mt-2 block font-medium">Verified completed</span>
        </div>

        {/* Closed */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Closed</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <Archive size={14} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-600 leading-none">{closedCount}</p>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">Archived tickets</span>
        </div>
      </section>

      {/* 2. Recent Complaints + Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Complaints */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Recent Complaints</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">High priority and latest civic reports</p>
            </div>
            <button 
              onClick={() => setShowAllComplaints(!showAllComplaints)}
              className="bg-slate-100 hover:bg-[#6032db] hover:text-white text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {showAllComplaints ? 'Show Top 5' : 'View All'}
            </button>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl text-xs font-semibold text-slate-400">
                No complaints currently logged.
              </div>
            ) : (
              (() => {
                const sorted = [...complaints].sort((a, b) => {
                  const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
                  const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
                  return scoreB - scoreA;
                });
                const displayList = showAllComplaints ? sorted : sorted.slice(0, 5);
                
                return displayList.map((c, idx) => (
                  <div
                    key={c._id}
                    onClick={() => navigate(`/complaint/${c._id}`)}
                    className="p-4 bg-white border border-slate-100 rounded-2xl shadow-2xs hover:shadow-md hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="space-y-1.5 max-w-[80%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#f3effe] text-[#6032db] border border-[#6032db]/10">
                          #{c.ticketId || c._id.slice(-6).toUpperCase()}
                        </span>
                        {idx < 5 && ((c.upvotes?.length || 0) - (c.downvotes?.length || 0)) > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Flame size={11} className="fill-amber-500" /> TRENDING
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(c.priority)}`}>
                          {c.priority || 'Normal'} Priority
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {c.department || 'General'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-[#6032db] transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      {c.location?.address && (
                        <p className="text-[11px] text-slate-500 m-0 flex items-center gap-1 truncate">
                          <MapPin size={11} className="shrink-0 text-slate-400" />
                          <span className="truncate">{c.location.address}</span>
                        </p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#6032db] group-hover:text-white flex items-center justify-center transition-all shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </section>

        {/* Right 1 Col: Quick Analytics Stats */}
        <section className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs flex items-center gap-2 text-slate-900 font-bold text-base">
            <TrendingUp size={18} className="text-[#6032db]" />
            <span>Operational Signals</span>
          </div>

          {analytics.length > 0 ? (
            (() => {
              const maxDay = analytics.reduce((a, b) => a.count > b.count ? a : b);
              const recent = analytics[analytics.length - 1];
              const prev = analytics[analytics.length - 2];
              const trend = !prev ? 'Stable' : recent.count > prev.count ? 'Increasing' : recent.count < prev.count ? 'Decreasing' : 'Stable';
              const total30 = analytics.reduce((sum, d) => sum + d.count, 0);

              return (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-[#f8fafd] to-[#edf7fe] border border-sky-100 rounded-2xl p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peak Volume Day</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1 mb-0">{maxDay.date}</p>
                    <span className="text-xs text-[#6032db] font-bold">{maxDay.count} complaints received</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Velocity Trend</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-bold ${trend === 'Increasing' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {trend}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Based on trailing 48-hour activity</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total 30-Day Activity</span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1 mb-0">{total30}</p>
                    <span className="text-[11px] text-slate-500 mt-1 block">City-wide cumulative submissions</span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-xs text-slate-400">
              No historical trends recorded yet.
            </div>
          )}
        </section>
      </div>

      {/* 3. Analytics Charts */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f3effe] text-[#6032db] flex items-center justify-center font-bold">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 m-0">Performance & Trend Analytics</h2>
              <p className="text-xs text-slate-500 m-0">Temporal volume distribution & department load</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Last 30 Days
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Line Chart */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Submissions per Day</span>
              {analytics.length > 0 && (
                <span className="text-[11px] font-extrabold text-[#6032db] bg-[#f3effe] px-2.5 py-0.5 rounded-full">
                  {analytics.reduce((s, d) => s + d.count, 0)} total
                </span>
              )}
            </div>
            {analytics.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
                No trend data for this window.
              </div>
            ) : (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6032db" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6032db" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(d) => {
                        const dt = new Date(d);
                        return `${dt.getDate()}/${dt.getMonth() + 1}`;
                      }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={24}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px', padding: '8px 12px' }}
                      itemStyle={{ color: '#a5b4fc' }}
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: any) => [`${value} complaints`, 'Volume']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6032db"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#6032db', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#5024c9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Department Bar Chart */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Distribution by Department</span>
              {complaints.length > 0 && (
                <span className="text-[11px] font-extrabold text-[#6032db] bg-[#f3effe] px-2.5 py-0.5 rounded-full">
                  {new Set(complaints.map(c => c.department).filter(Boolean)).size} departments
                </span>
              )}
            </div>
            {complaints.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
                No complaint department data.
              </div>
            ) : (() => {
              const deptMap = new Map<string, number>();
              complaints.forEach(c => {
                if (c.department) deptMap.set(c.department, (deptMap.get(c.department) || 0) + 1);
              });
              const deptData = [...deptMap.entries()]
                .map(([dept, count]) => ({ dept, count }))
                .sort((a, b) => b.count - a.count);
              const colors = ['#6032db', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

              return (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={deptData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                      <XAxis
                        dataKey="dept"
                        tick={{ fontSize: 9, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        width={24}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px', padding: '8px 12px' }}
                        itemStyle={{ color: '#a5b4fc' }}
                        formatter={(value: any) => [`${value} complaints`, 'Total']}
                      />
                      <Bar dataKey="count" maxBarSize={36} radius={[6, 6, 0, 0]}>
                        {deptData.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 4. Map & Geographical Breakdown */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#eaf4fd] text-[#0284c7] flex items-center justify-center font-bold">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 m-0">Live Geographic Distribution</h2>
              <p className="text-xs text-slate-500 m-0">Spatial clustering across municipal sectors</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Map</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map */}
          <div className="lg:col-span-2 h-[420px] rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
            <MapContainer
              center={[21.1458, 79.0882]}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; <a href="https://maps.google.com/">Google</a>'
              />
              {complaints.filter(c => c.location?.lat && c.location?.lng).map(point => (
                <Marker key={point._id} position={[point.location.lat, point.location.lng]}>
                  <Popup>
                    <div className="p-1 font-sans">
                      <div className="font-bold text-slate-900 text-xs mb-1">
                        {point.title}
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p className="m-0"><span className="font-semibold text-slate-800">Dept:</span> {point.department}</p>
                        <p className="m-0"><span className="font-semibold text-slate-800">Ticket:</span> #{point.ticketId}</p>
                        <p className="m-0"><span className="font-semibold text-slate-800">Status:</span> {point.status}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Location Breakdown List */}
          <div className="h-[420px] border border-slate-100 rounded-2xl flex flex-col bg-slate-50/40 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Hotspot Breakdown</span>
              <span className="text-[10px] font-extrabold text-[#6032db] bg-[#f3effe] px-2 py-0.5 rounded-full">
                {(() => {
                  const addrs = new Set(complaints.map(c => c.location?.address).filter((addr): addr is string => Boolean(addr)));
                  return `${addrs.size} sectors`;
                })()}
              </span>
            </div>
            <div className="overflow-y-auto flex-grow divide-y divide-slate-100 p-2 space-y-1.5">
              {complaints.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No geo-tagged complaints.</div>
              ) : (() => {
                const locationMap = new Map<string, { address: string; count: number; departments: Set<string> }>();
                complaints.forEach(c => {
                  const addr = c.location?.address;
                  if (!addr) return;
                  if (!locationMap.has(addr)) {
                    locationMap.set(addr, { address: addr, count: 0, departments: new Set() });
                  }
                  const loc = locationMap.get(addr)!;
                  loc.count++;
                  if (c.department) loc.departments.add(c.department);
                });
                const sorted = [...locationMap.values()].sort((a, b) => b.count - a.count);
                return sorted.map((loc, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-100/80 shadow-2xs hover:border-purple-200 transition-all">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-xs font-bold text-slate-800 leading-snug flex-1 line-clamp-2 m-0">{loc.address}</p>
                      <span className="text-xs font-extrabold text-[#6032db] bg-[#f3effe] px-2 py-0.5 rounded-lg shrink-0">{loc.count}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...loc.departments].map(dept => (
                        <span key={dept} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};