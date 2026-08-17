import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Sparkles, X, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api, { SOCKET_BASE_URL } from '../services/api';
import { useTranslation } from 'react-i18next';

let socket: Socket;

interface Message {
  _id: string;
  text: string;
  authorName: string;
  user: string;
  createdAt: string;
  isAuthority?: boolean;
}

export const Community = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ title: string; description: string; priority: string }[] | null>(null);

  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
              if (derivedCity) {
                setCity(derivedCity);
                setLocating(false);
              } else {
                setLocating(false);
                setError("Unable to derive specific city bounds from coordinates.");
              }
            }
          } catch (e) {
            setLocating(false);
            setError("City localization logic failed.");
          }
        },
        (err) => {
          setLocating(false);
          setError('Location access required for local city forum. ' + err.message);
        }
      );
    } else {
      setLocating(false);
      setError('Browser does not support geolocation.');
    }
  }, []);

  useEffect(() => {
    if (!city || !user) return;
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/community/${city}/messages`);
        setMessages(data);
      } catch (err) {
        console.error("History fetch failed", err);
      }
    };
    fetchHistory();
    socket = io(SOCKET_BASE_URL);
    socket.emit('joinCity', { city, userName: user.name });

    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('activeUsers', (users: string[]) => {
      setActiveUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [city, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !socket || !city || !user) return;

    socket.emit('sendMessage', {
      text: currentMessage,
      userId: user.id,
      authorName: user.name,
      city
    });

    setCurrentMessage('');
  };

  const handleAnalyze = async () => {
    if (messages.length === 0) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const { data } = await api.post(`/community/${city}/analyze`);
      if (data && data.issues) {
        setAnalysisResult(data.issues);
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (locating) {
    return (
      <div className="max-w-xl mx-auto my-16 border border-slate-200 rounded-3xl p-12 text-center bg-white shadow-sm">
        <Loader2 className="animate-spin text-[#6032db] mx-auto mb-3" size={24} />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 m-0">Connecting to {city || 'forum'}...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-16 border border-slate-200 rounded-3xl p-8 text-center bg-white text-xs">
        <h2 className="font-bold text-rose-600 uppercase m-0">Location Access Needed</h2>
        <p className="mt-2 text-slate-600 m-0">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      <div className="border border-slate-200/90 bg-white p-6 sm:p-8 rounded-3xl flex flex-col h-[75vh] shadow-xl shadow-purple-900/5 font-sans text-slate-900">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-4 shrink-0">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 m-0">
                {city} Forum
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                {t('dashboard.liveFeed')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || messages.length === 0}
                className="flex items-center gap-1.5 bg-purple-50 text-[#6032db] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                <Sparkles size={13} className={analyzing ? 'animate-spin' : ''} />
                <span>{analyzing ? t('dashboard.analyzing') : t('dashboard.aiAnalyze')}</span>
              </button>
            </div>
          </div>

          {/* Active online row */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 shrink-0">{t('dashboard.activeUser')}:</span>
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="w-fit flex gap-1.5">
                  {activeUsers.map((name, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-800">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message feed */}
        <div className="flex-grow overflow-y-auto text-xs flex flex-col gap-3 mb-4 pr-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="m-auto text-center text-xs text-slate-400 italic py-10">
              No messages in {city} grid yet.
            </div>
          )}
          {messages.map((msg, index) => {
            const isSelf = msg.user === user?.id;
            const isAuth = msg.isAuthority;
            return (
              <div key={msg._id || index} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold text-slate-500">
                  <span>{msg.authorName}</span>
                  {isAuth && (
                    <span className="bg-[#6032db] text-white px-1.5 py-0.2 rounded-full text-[9px]">
                      OFFICIAL
                    </span>
                  )}
                  <span className="text-slate-400">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`p-3.5 max-w-[80%] leading-relaxed rounded-2xl
                  ${isAuth ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    isSelf ? 'bg-[#6032db] text-white rounded-br-none shadow-sm' :
                    'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-slate-100 shrink-0 items-center">
          <input
            type="text"
            placeholder={t('dashboard.broadcastPlaceholder')}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="flex-1 bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#6032db] focus:bg-white focus:ring-4 focus:ring-[#6032db]/10 focus:outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={!currentMessage.trim()} 
            className="bg-[#6032db] hover:bg-[#5024c9] text-white p-3 rounded-xl cursor-pointer disabled:opacity-40 transition-all shadow-xs"
          >
            <Send size={15} />
          </button>
        </form>

        {/* AI Analysis Modal */}
        {analysisResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
            <div className="bg-white border border-slate-150 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setAnalysisResult(null)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-full cursor-pointer"
              >
                <X size={14} />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {t('dashboard.intelligenceReport')}
              </h3>
              <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-2 font-semibold">
                Automated Civic Sector Synthesis
              </p>

              <div className="space-y-3">
                {analysisResult.map((issue, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug m-0">{issue.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6032db] border border-purple-200 shrink-0">
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed m-0 font-normal">
                      "{issue.description}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
