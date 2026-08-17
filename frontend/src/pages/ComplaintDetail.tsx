import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { SOCKET_BASE_URL } from '../services/api';
import { ArrowLeft, Clock, MapPin, Building2, Tag, Hash, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_STEPS = ['Pending', 'Investigating', 'Dispatched', 'Resolved'] as const;

const Field = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) =>
  value ? (
    <div className="space-y-1">
      <p className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">{icon}{label}</p>
      <p className="text-xs font-bold text-slate-800 leading-tight m-0">{value}</p>
    </div>
  ) : null;

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await api.delete(`/complaints/${id}`);
      navigate('/dashboard');
    } catch {
      setWithdrawing(false);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/complaints/${id}`);
        setComplaint(data);
      } catch (err: any) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 p-20 text-xs text-slate-400">
      <Loader2 size={24} className="animate-spin text-[#6032db]" />
      <span>{t('detail.loading')}</span>
    </div>
  );

  if (notFound || !complaint) return (
    <div className="text-center p-20 space-y-4 text-xs bg-white">
      <p className="font-bold text-slate-800">{t('detail.notFound')}</p>
      <button onClick={() => navigate('/dashboard')} className="font-bold text-[#6032db] underline underline-offset-4 cursor-pointer">{t('detail.backToDashboard')}</button>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.indexOf(complaint.status as any);

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 sm:px-6 space-y-6 font-sans text-slate-900 bg-white pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#6032db] transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> <span>{t('detail.myComplaints')}</span>
      </button>

      {/* Header card */}
      <div className="border border-slate-200/90 p-6 sm:p-8 bg-white rounded-3xl shadow-xl shadow-purple-900/5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold bg-[#6032db] text-white px-2.5 py-0.5 rounded-full uppercase">
            #{complaint.ticketId}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6032db] border border-purple-200 uppercase">
            {complaint.status}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
            {complaint.priority} PRIORITY
          </span>
          {complaint.duplicateFlag && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">
              {t('detail.similarExists')}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug m-0">
          {complaint.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl m-0 font-normal">
          {complaint.description}
        </p>
      </div>

      {/* Stepper Timeline */}
      <div className="border border-slate-200/80 p-6 sm:p-8 bg-white rounded-3xl shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3 m-0">
          {t('detail.statusHeader')}
        </h2>
        {complaint.status === 'Closed' ? (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <CheckCircle2 size={16} className="text-slate-400" /> <span>{t('detail.caseClosed')}</span>
          </div>
        ) : (
          <div className="flex items-start w-full px-2">
            {STATUS_STEPS.map((step, i) => {
              const done = currentStepIdx >= i;
              const active = currentStepIdx === i;
              return (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div className={`w-full h-1 ${i === 0 ? 'invisible' : done ? 'bg-[#6032db]' : 'bg-slate-100'}`} />
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all
                      ${done ? 'bg-[#6032db] text-white text-xs font-bold shadow-xs' : 'bg-slate-100 text-slate-400 text-xs font-bold'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div className={`w-full h-1 ${i === STATUS_STEPS.length - 1 ? 'invisible' : done && currentStepIdx > i ? 'bg-[#6032db]' : 'bg-slate-100'}`} />
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 text-center ${active ? 'text-[#6032db]' : done ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="border border-slate-200/80 p-6 sm:p-8 bg-white rounded-3xl shadow-2xs grid grid-cols-2 sm:grid-cols-3 gap-6">
        <Field label={t('detail.dept')} value={complaint.department} icon={<Building2 size={13} className="text-[#6032db]" />} />
        <Field label={t('detail.ward')} value={complaint.administrativeWard || 'Ward 1'} icon={<Hash size={13} className="text-[#6032db]" />} />
        <Field label={t('detail.priority')} value={complaint.priority} icon={<AlertCircle size={13} className="text-[#6032db]" />} />
        <Field label={t('detail.statusLabel')} value={complaint.status} icon={<Tag size={13} className="text-[#6032db]" />} />
        <Field
          label={t('detail.filedOn')}
          value={new Date(complaint.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
          icon={<Clock size={13} className="text-[#6032db]" />}
        />
        {complaint.timeOfOccurrence && (
          <Field
            label={t('detail.occurredAt')}
            value={new Date(complaint.timeOfOccurrence).toLocaleString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            icon={<Clock size={13} className="text-[#6032db]" />}
          />
        )}
        {complaint.location?.address && (
          <div className="col-span-2 sm:col-span-3 border-t border-slate-100 pt-4 mt-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#6032db]" /> {t('detail.location')}
            </p>
            <p className="text-xs font-bold text-slate-800 m-0">{complaint.location.address}</p>
            {complaint.location.city && (
              <p className="text-[11px] text-slate-500 mt-0.5 m-0">{complaint.location.city}, {complaint.location.state}</p>
            )}
          </div>
        )}
      </div>

      {/* Evidence Image */}
      {complaint.images?.[0] && (
        <div className="border border-slate-200/80 p-6 bg-white rounded-3xl shadow-2xs">
          <p className="text-xs font-bold text-slate-800 mb-3 m-0">{t('detail.attachedPhoto')}</p>
          <div className="border border-slate-100 rounded-2xl max-w-md overflow-hidden shadow-xs">
            <img
              src={complaint.images[0].startsWith('http') ? complaint.images[0] : `${SOCKET_BASE_URL}/${complaint.images[0].replace(/\\/g, '/')}`}
              alt="Evidence"
              className="w-full object-cover max-h-64"
            />
          </div>
        </div>
      )}

      {/* Updates History Log */}
      <div className="border border-slate-200/80 p-6 sm:p-8 bg-white rounded-3xl shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3 m-0 flex items-center gap-2">
          <Clock size={16} className="text-[#6032db]" /> <span>{t('detail.history')}</span>
        </h2>
        {(!complaint.statusUpdates || complaint.statusUpdates.length === 0) ? (
          <p className="text-xs text-slate-400 italic py-4 text-center m-0">
            {t('detail.noUpdates')}
          </p>
        ) : (
          <div className="space-y-6 relative pl-4 border-l-2 border-purple-100">
            {[...complaint.statusUpdates].reverse().map((up: any, i: number) => (
              <div key={i} className="relative space-y-1">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#6032db]" />
                <div className="flex items-center justify-between gap-4 flex-wrap pb-0.5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-[#6032db] border border-purple-200">
                    {up.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(up.timestamp).toLocaleString(i18n.language === 'en' ? 'en-IN' : i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-0.5 m-0 font-normal">{up.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-xs font-bold px-4 py-2 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer transition-colors"
        >
          <Trash2 size={13} className="inline mr-1" /> Withdraw Request
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white border border-slate-150 p-6 max-w-sm w-full mx-4 rounded-3xl space-y-4 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Withdraw Complaint?</h3>
              <p className="text-xs text-slate-500 leading-relaxed m-0 font-normal">
                This will permanently delete your report from the municipal log.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer flex-1"
              >
                {withdrawing ? 'Deleting...' : 'Withdraw'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
