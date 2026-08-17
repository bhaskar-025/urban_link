import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { io, Socket } from 'socket.io-client';
import api, { SOCKET_BASE_URL } from '../services/api';
import { Send, Users, Sparkles, X, MessageSquare } from 'lucide-react';
import { MonoButton } from '../components/ui/MonoButton';

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
  const [city] = useState(user?.city || 'Nagpur'); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ title: string; description: string; priority: string }[] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      city,
      isAuthority: true // Admin flag
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

  return (
    <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-[82vh] overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-5 px-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f3effe] text-[#6032db] flex items-center justify-center font-bold shadow-2xs">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 m-0">
                {city} Local Grid
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f3effe] text-[#6032db] px-2 py-0.5 rounded-full border border-[#6032db]/20">
                Official Channel
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Real-time citizen dispatch feed & civic alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing || messages.length === 0}
            className="flex items-center gap-1.5 bg-[#6032db] text-white hover:bg-[#5024c9] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <Sparkles size={14} className={analyzing ? 'animate-spin' : ''} />
            <span>{analyzing ? 'Scanning Feed...' : 'AI Topic Radar'}</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeUsers.length} Active</span>
          </div>
        </div>
      </header>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/40">
        {/* AI Analysis Panel */}
        {analysisResult && (
          <div className="bg-[#6032db] text-white rounded-3xl p-6 relative shadow-lg shadow-[#6032db]/20 animate-in fade-in slide-in-from-top-4 duration-300 mb-2">
            <button 
              onClick={() => setAnalysisResult(null)}
              className="absolute top-4 right-4 text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-purple-200" />
              <h3 className="text-base font-bold text-white m-0">
                AI Incident Radar Analysis
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.map((issue, i) => (
                <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-bold text-xs text-white">{issue.title}</span>
                    <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-white/20 text-white">
                      {issue.priority}
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed m-0 font-normal">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3">
              <Users size={24} className="text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-600 mb-1">No community messages yet</p>
            <p className="text-[11px] text-slate-400 m-0">Send an official bulletin or dispatch notification below.</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isSelf = msg.user === user?.id;
          const isAuth = msg.isAuthority;
          return (
            <div key={msg._id || index} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className={`text-[11px] font-bold ${isAuth ? 'text-[#6032db]' : 'text-slate-600'}`}>
                  {msg.authorName}
                </span>
                {isAuth && (
                  <span className="bg-[#f3effe] text-[#6032db] border border-[#6032db]/20 text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                    OFFICIAL
                  </span>
                )}
                <span className="text-[10px] text-slate-400 ml-1">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-xs leading-relaxed transition-all shadow-2xs ${
                isAuth 
                  ? 'bg-[#6032db] text-white rounded-tr-none' 
                  : isSelf 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <p className="m-0">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Send Footer */}
      <form onSubmit={handleSend} className="p-4 px-6 bg-white border-t border-slate-100 flex items-center gap-3">
        <div className="flex-1">
          <input 
            type="text"
            placeholder="Broadcast an official message to the local grid..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:border-[#6032db] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <MonoButton 
          type="submit"
          disabled={!currentMessage.trim()}
          className="py-2.5 px-5 font-bold flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send size={13} />
        </MonoButton>
      </form>
    </div>
  );
};
