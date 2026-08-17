import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MonoInput } from '../components/ui/MonoInput';
import { MonoButton } from '../components/ui/MonoButton';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth({ 
        id: res.data.id, 
        name: res.data.name, 
        email: res.data.email, 
        role: res.data.role,
        phoneNumber: res.data.phoneNumber 
      }, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginError') || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-6">
      <div className="border border-slate-200/90 p-8 sm:p-9 bg-white rounded-3xl shadow-lg shadow-purple-900/5">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6032db] text-white flex items-center justify-center font-bold text-sm shadow-sm mb-3">
            <Sparkles size={18} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Sign in to manage and track your civic issue reports.
          </p>
        </div>
        
        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <MonoInput 
            label={t('auth.emailLabel')} 
            type="email" 
            required 
            placeholder="citizen@citysync.app"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <MonoInput 
            label={t('auth.passwordLabel')} 
            type="password" 
            required 
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <div className="pt-2">
            <MonoButton 
              type="submit" 
              fullWidth 
              variant="primary"
              disabled={loading}
              className="py-3 font-bold flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Authenticating...' : t('auth.loginBtn')}</span>
              <ArrowRight size={14} />
            </MonoButton>
          </div>
        </form>
        
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
          <span className="text-slate-500">Don't have an account? </span>
          <Link to="/register" className="text-[#6032db] font-bold hover:underline underline-offset-4">
            {t('auth.newUser')}
          </Link>
        </div>
      </div>
    </div>
  );
};
