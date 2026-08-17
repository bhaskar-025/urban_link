import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { MonoInput } from '../components/ui/MonoInput';
import { MonoButton } from '../components/ui/MonoButton';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.role !== 'admin') {
                setError('Access denied. This portal is restricted to administrators only.');
                return;
            }

            setAuth(data, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full my-8 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-purple-900/5">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#6032db] text-white flex items-center justify-center font-bold text-base shadow-md shadow-[#6032db]/25 mb-4">
                        <Shield size={24} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3effe] text-[11px] font-bold text-[#6032db] mb-2">
                        <Sparkles size={12} />
                        <span>Administrative Portal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
                        Admin Sign In
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 m-0 max-w-xs">
                        Enter your administrative credentials to manage city complaints and operational teams.
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-semibold mb-6 flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <MonoInput
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@citysync.gov"
                    />

                    <div className="relative">
                        <MonoInput
                            label="Password"
                            type={showPass ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="pt-3">
                        <MonoButton 
                            type="submit" 
                            fullWidth 
                            disabled={loading} 
                            className="py-3 font-bold flex items-center justify-center gap-2"
                        >
                            <span>{loading ? 'Signing in...' : 'Sign In to Control Center'}</span>
                            <ArrowRight size={15} />
                        </MonoButton>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs">
                    <span className="text-slate-500">Need an administrative account? </span>
                    <Link to="/register" className="text-[#6032db] font-bold hover:underline underline-offset-4">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};
