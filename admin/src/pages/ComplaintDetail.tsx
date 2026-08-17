import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { SOCKET_BASE_URL } from '../services/api';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Building2, 
  Hash, 
  AlertCircle, 
  Send, 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { MonoButton } from '../components/ui/MonoButton';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Investigating: 'bg-sky-50 text-sky-700 border-sky-200',
  Dispatched: 'bg-[#6032db] text-white border-transparent',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const Field = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
      {icon} <span>{label}</span>
    </p>
    <p className="text-xs font-bold text-slate-800 m-0 truncate">{value || '—'}</p>
  </div>
);

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [newUpdate, setNewUpdate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get('/admin/complaints');
        const target = data.find((c: any) => c._id === id);
        setComplaint(target);
        setNewStatus(target?.status || '');
      } catch (err) {
        console.error("Fetch detail failed", err);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/complaints/${id}`, { status: newStatus, message: newUpdate });
      const { data } = await api.get('/admin/complaints');
      const target = data.find((c: any) => c._id === id);
      setComplaint(target);
      setNewUpdate('');
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdating(false);
    }
  };

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white border border-slate-100 rounded-3xl">
        <div className="w-8 h-8 border-3 border-[#6032db]/20 border-t-[#6032db] rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading complaint profile...</p>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[complaint.status] || 'bg-slate-100 text-slate-600 border-slate-200';
  const priorityStyle = PRIORITY_STYLES[complaint.priority] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#6032db] transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> <span>Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and main issue card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#f3effe] text-[#6032db] border border-[#6032db]/20">
                #{complaint.ticketId || complaint._id.slice(-6).toUpperCase()}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusStyle}`}>
                  {complaint.status}
                </span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${priorityStyle}`}>
                  {complaint.priority} Priority
                </span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
              {complaint.title}
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 m-0">
              {complaint.description}
            </p>
          </div>

          {/* Details grid */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#6032db]" />
              <span>Metadata & Assignment</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Department" value={complaint.department} icon={<Building2 size={12} />} />
              <Field label="Ward" value={complaint.administrativeWard || 'Ward 1'} icon={<Hash size={12} />} />
              <Field label="Priority" value={complaint.priority} icon={<AlertCircle size={12} />} />
              <Field label="Citizen Name" value={complaint.user?.name || 'Anonymous'} icon={<User size={12} />} />
              <Field label="Citizen Contact" value={complaint.user?.phoneNumber || complaint.user?.email} icon={<Mail size={12} />} />
              <Field
                label="Filed On"
                value={new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                icon={<Calendar size={12} />}
              />
            </div>

            {complaint.location?.address && (
              <div className="mt-4 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#6032db]" /> <span>Geo Location</span>
                </p>
                <p className="text-xs font-bold text-slate-800 m-0">{complaint.location.address}</p>
                {complaint.location.city && (
                  <p className="text-[11px] text-slate-500 mt-0.5 m-0">{complaint.location.city}, {complaint.location.state}</p>
                )}
              </div>
            )}
          </div>

          {/* Image */}
          {complaint.images?.[0] && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-800 mb-3">On-ground Photo Evidence</p>
              <img 
                src={complaint.images[0].startsWith('http') ? complaint.images[0] : `${SOCKET_BASE_URL}/${complaint.images[0].replace(/\\/g, '/')}`} 
                alt="Complaint evidence" 
                className="w-full object-cover rounded-2xl border border-slate-100 max-h-80" 
              />
            </div>
          )}
        </div>

        {/* Right 1 Col: Admin Status Update & History */}
        <div className="space-y-6">
          {/* Update status form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck size={18} className="text-[#6032db]" />
              <h2 className="text-sm font-bold text-slate-900 m-0">Update Status & Dispatch</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Lifecycle State</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#6032db] focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Pending">Pending Assignment</option>
                  <option value="Investigating">Investigating / Inspection</option>
                  <option value="Dispatched">Dispatched to Ground Crew</option>
                  <option value="Resolved">Resolved & Verified</option>
                  <option value="Closed">Closed / Archived</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Official Note for Citizen</label>
                <textarea
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 h-28 focus:border-[#6032db] focus:bg-white focus:outline-none transition-all resize-none placeholder:text-slate-400"
                  placeholder="e.g. Repair crew dispatched with truck ID #48..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                />
              </div>

              <MonoButton
                type="submit"
                fullWidth
                disabled={updating}
                className="py-2.5 font-bold flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>{updating ? 'Saving Changes...' : 'Publish Update'}</span>
              </MonoButton>
            </form>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Clock size={14} className="text-[#6032db]" />
              <span>Audit Trail</span>
            </h2>
            
            {(!complaint.statusUpdates || complaint.statusUpdates.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-6">No historical notes recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {[...complaint.statusUpdates].reverse().map((up: any, i: number) => (
                  <div key={i} className="border-l-2 border-[#6032db]/40 pl-3.5 space-y-1 relative">
                    <div className="w-2 h-2 rounded-full bg-[#6032db] absolute -left-[5px] top-1"></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f3effe] text-[#6032db]">
                        {up.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(up.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal m-0">{up.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
