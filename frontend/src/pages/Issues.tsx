import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { MonoCard } from '../components/ui/MonoCard';
import { ThumbsUp, ThumbsDown, Flame, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Complaint {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  department: string;
  status: string;
  location: {
    address: string;
    city: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

export const Issues = () => {
  const { user } = useAuthStore();
  const [city, setCity] = useState(user?.city || '');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const detectCity = async () => {
      if (city) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=en`
              );
              const data = await response.json();
              if (data && data.address) {
                const derivedCity = data.address.city || data.address.town || data.address.village || data.address.county;
                if (derivedCity) setCity(derivedCity);
              }
            } catch (e) {
              console.error("City localization failed");
            }
          }
        );
      }
    };
    detectCity();
  }, [city]);

  useEffect(() => {
    if (!city) return;
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/complaints/city/${city}`);
        setComplaints(data);
      } catch (err) {
        setError('Failed to fetch community issues for your area.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [city]);

  const handleVote = async (id: string, type: 'up' | 'down') => {
    try {
      const endpoint = `/complaints/${id}/${type}vote`;
      const { data } = await api.post(endpoint);
      setComplaints(prev => prev.map(c => c._id === id ? data : c));
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  const sortedIssues = [...complaints].sort((a, b) => {
    const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
    const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
    return scoreB - scoreA;
  });

  const trendingIds = sortedIssues.slice(0, 3).map(c => c._id);

  if (loading && !city) {
    return (
      <div className="max-w-xl mx-auto my-16 border border-slate-200 rounded-3xl p-12 text-center bg-white shadow-sm">
        <Loader2 className="animate-spin text-[#6032db] mx-auto mb-3" size={24} />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Locating sector...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 font-sans text-slate-900 bg-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
            Community Issues
          </h1>
          <p className="text-xs font-bold text-[#6032db] uppercase tracking-wider mt-0.5 m-0">
            Sector: {city || 'Detecting...'}
          </p>
        </div>
      </header>

      {error && (
        <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">
          Syncing community issues...
        </div>
      ) : sortedIssues.length === 0 ? (
        <div className="p-16 text-center border border-slate-100 rounded-3xl bg-slate-50/50">
          <p className="text-xs text-slate-400 m-0">No complaints reported in your area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedIssues.map((issue) => {
            const upvotes = issue.upvotes?.length || 0;
            const downvotes = issue.downvotes?.length || 0;
            const isTrending = trendingIds.includes(issue._id);
            const userUpvoted = issue.upvotes?.includes(user?.id || '');
            const userDownvoted = issue.downvotes?.includes(user?.id || '');

            return (
              <MonoCard key={issue._id} className="flex flex-col h-full border border-slate-100 p-6 rounded-2xl bg-white hover:border-purple-200 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      #{issue.ticketId}
                    </span>
                    {isTrending && (
                      <span className="text-[9px] font-bold uppercase flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                        <Flame size={10} /> TRENDING
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6032db] border border-purple-200">
                    {issue.status}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {issue.department}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3 font-normal">
                  {issue.description}
                </p>

                <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(issue._id, 'up')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${userUpvoted ? 'bg-[#6032db] text-white border-[#6032db]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <ThumbsUp size={12} /> <span>{upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(issue._id, 'down')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${userDownvoted ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <ThumbsDown size={12} /> <span>{downvotes}</span>
                    </button>
                  </div>
                  <Link
                    to={`/complaint/${issue._id}`}
                    className="text-xs font-bold text-[#6032db] hover:underline underline-offset-4"
                  >
                    View Details →
                  </Link>
                </div>
              </MonoCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
